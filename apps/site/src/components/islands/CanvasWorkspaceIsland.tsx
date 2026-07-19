import { useEffect, useMemo, useRef, useState } from "react";
import { CanvasSystemGrid, CanvasSystemMetadataEditor, CanvasSystemShell, CanvasSystemZone, type CanvasSystemMetadata, type CanvasSystemSection } from "@apiops/design-system/react";

type Note = { content: string; color: string; size: number };
type Metadata = CanvasSystemMetadata;
export type CanvasSection = CanvasSystemSection;
export type CanvasDefinition = { id: string; title: string; purpose: string; howToUse: string; layout: { columns: number; rows: number }; sections: CanvasSection[]; metadata?: { source?: string; license?: string; authors?: string[] }; footer?: string; importExportTemplate: { templateId: string; metadata: Record<string, unknown> } };

export default function CanvasWorkspaceIsland({ locale, entityId, entityTitle, canvas }: { locale: string; entityId: string; entityTitle: string; canvas: CanvasDefinition }) {
  const key = `apiops-canvas:${entityId}:${canvas.id}`;
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [metadata, setMetadata] = useState<Metadata>({ title: canvas.title, owner: "", context: entityTitle, date: "" });
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem(key);
      const savedMetadata = localStorage.getItem(`${key}:metadata`);
      if (saved) setNotes(JSON.parse(saved) as Record<string, Note[]>);
      setMetadata(savedMetadata ? JSON.parse(savedMetadata) as Metadata : { title: canvas.title, owner: "", context: entityTitle, date: new Date().toISOString().slice(0, 10) });
      setLoaded(true);
    });
  }, [canvas.title, entityTitle, key]);
  useEffect(() => { if (loaded) localStorage.setItem(key, JSON.stringify(notes)); }, [key, loaded, notes]);
  useEffect(() => { if (loaded && metadata.date) localStorage.setItem(`${key}:metadata`, JSON.stringify(metadata)); }, [key, loaded, metadata]);

  const markdown = useMemo(() => `# ${metadata.title || canvas.title}\n\n${canvas.purpose}\n\n${canvas.howToUse}\n\nOwner: ${metadata.owner || "—"}\nContext: ${metadata.context}\nDate: ${metadata.date}\n\n${canvas.sections.map((section) => `## ${section.title}\n\n${section.description}\n\n${(notes[section.id] ?? []).map((note) => `- ${note.content}`).join("\n") || "- "}`).join("\n\n")}${canvas.footer ? `\n\n---\n${canvas.footer}` : ""}\n`, [canvas, metadata, notes]);
  const payload = () => ({ ...canvas.importExportTemplate, locale, canvasMetadata: metadata, sections: canvas.sections.map((section) => ({ sectionId: section.id, stickyNotes: notes[section.id] ?? [] })) });
  function download(content: string, type: string, extension: string) { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement("a"); link.href = url; link.download = `${canvas.id}_${locale}.${extension}`; link.click(); URL.revokeObjectURL(url); setStatus(`${extension.toUpperCase()} exported.`); }
  async function importJson(file: File) { const value = JSON.parse(await file.text()) as { templateId?: string; canvasMetadata?: Metadata; sections?: { sectionId: string; stickyNotes: Note[] }[] }; if (value.templateId && value.templateId !== canvas.importExportTemplate.templateId) throw new Error("This file belongs to a different canvas template."); if (!Array.isArray(value.sections)) throw new Error("Invalid canvas JSON."); setNotes(Object.fromEntries(value.sections.map((section) => [section.sectionId, section.stickyNotes]))); if (value.canvasMetadata) setMetadata(value.canvasMetadata); setStatus("JSON imported."); }
  return <section className="island-panel workspace"><CanvasSystemShell title={canvas.title} kicker="Local workspace" description={`${canvas.purpose} ${canvas.howToUse}`} toolbar={<div className="canvas-toolbar"><button type="button" onClick={() => download(markdown, "text/markdown", "md")}>Export Markdown</button><button type="button" onClick={() => download(JSON.stringify(payload(), null, 2), "application/json", "json")}>Export JSON</button><button type="button" onClick={() => importRef.current?.click()}>Import JSON</button><input ref={importRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importJson(file).catch((error: Error) => setStatus(error.message)); }} /></div>} metadata={<CanvasSystemMetadataEditor metadata={metadata} labels={{ title: "Canvas metadata", owner: "Owner", context: "Context", date: "Date" }} onChange={setMetadata} />}>
    <CanvasSystemGrid columns={canvas.layout.columns} rows={canvas.layout.rows}>{canvas.sections.map((section) => <CanvasSystemZone key={section.id} section={section} notes={(notes[section.id] ?? []).map((note, index) => ({ id: `${section.id}:${index}`, text: note.content, color: note.color }))} addLabel="Add a sticky note" deleteLabel="Remove note" onNoteChange={(noteId, text) => { const index = Number(noteId.split(":").pop()); setNotes((current) => ({ ...current, [section.id]: current[section.id].map((item, itemIndex) => itemIndex === index ? { ...item, content: text } : item) })); }} onNoteDelete={(noteId) => { const index = Number(noteId.split(":").pop()); setNotes((current) => ({ ...current, [section.id]: current[section.id].filter((_, itemIndex) => itemIndex !== index) })); }} noteInput={<form onSubmit={(event) => { event.preventDefault(); const input = event.currentTarget.elements.namedItem("note") as HTMLInputElement; if (!input.value.trim()) return; setNotes((current) => ({ ...current, [section.id]: [...(current[section.id] ?? []), { content: input.value.trim(), color: section.defaultNoteColor || "#fff399", size: 80 }] })); input.value = ""; }}><input name="note" aria-label={`New note for ${section.title}`} placeholder="Add a sticky note" /><button type="submit" className="ds-canvas-add-note">Add</button></form>} />)}</CanvasSystemGrid>
    </CanvasSystemShell>
    <p role="status">{status}</p>
  </section>;
}
