import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasSystemGrid,
  CanvasSystemMetadataEditor,
  CanvasSystemMetadataReadOnly,
  CanvasSystemShell,
  CanvasSystemZone,
  type CanvasSystemMetadata,
  type CanvasSystemSection,
} from "@apiops/design-system/react";
import { canvasStorageKeys, createCanvasExport, parseCanvasExport } from "../../lib/canvas-workspace.mjs";
import { visibleCanvasSections } from "../../lib/canvas-focus.mjs";

type Note = { content: string; color: string; size: number };
type Metadata = CanvasSystemMetadata;
export type CanvasSection = CanvasSystemSection;
export type CanvasDefinition = {
  id: string;
  title: string;
  purpose: string;
  howToUse: string;
  layout: { columns: number; rows: number };
  sections: CanvasSection[];
  metadata?: { source?: string; license?: string; authors?: string[] };
  footer?: string;
  importExportTemplate: { templateId: string; metadata: Record<string, unknown> };
};

export default function CanvasWorkspaceIsland({
  locale,
  entityId,
  entityTitle,
  canvas,
  labels,
}: {
  locale: string;
  labels: Record<string, string>;
  entityId: string;
  entityTitle: string;
  canvas: CanvasDefinition;
}) {
  const keys = useMemo(() => canvasStorageKeys(entityId, canvas.id), [canvas.id, entityId]);
  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [metadata, setMetadata] = useState<Metadata>({ title: canvas.title, owner: "", context: entityTitle, date: "" });
  const [status, setStatus] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(canvas.sections[0]?.id);
  const [focusOnly, setFocusOnly] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const saved = localStorage.getItem(keys.notes);
      const savedMetadata = localStorage.getItem(keys.metadata);
      try {
        if (saved) setNotes(JSON.parse(saved) as Record<string, Note[]>);
      } catch {
        localStorage.removeItem(keys.notes);
      }
      try {
        setMetadata(
          savedMetadata
            ? (JSON.parse(savedMetadata) as Metadata)
            : { title: canvas.title, owner: "", context: entityTitle, date: new Date().toISOString().slice(0, 10) },
        );
      } catch {
        localStorage.removeItem(keys.metadata);
      }
      setLoaded(true);
    });
  }, [canvas.title, entityTitle, keys]);

  useEffect(() => {
    if (loaded) localStorage.setItem(keys.notes, JSON.stringify(notes));
  }, [keys, loaded, notes]);

  useEffect(() => {
    if (loaded && metadata.date) localStorage.setItem(keys.metadata, JSON.stringify(metadata));
  }, [keys, loaded, metadata]);

  useEffect(() => {
    if (!presentationMode) return;
    const previousOverflow = document.body.style.overflow;
    const exitOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPresentationMode(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", exitOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", exitOnEscape);
    };
  }, [presentationMode]);

  const markdown = useMemo(
    () =>
      `# ${metadata.title || canvas.title}\n\n${canvas.purpose}\n\n${canvas.howToUse}\n\nOwner: ${metadata.owner || "\u2014"}\nContext: ${metadata.context}\nDate: ${metadata.date}\n\n${canvas.sections
        .map((section) => `## ${section.title}\n\n${section.description}\n\n${(notes[section.id] ?? []).map((note) => `- ${note.content}`).join("\n") || "- "}`)
        .join("\n\n")}${canvas.footer ? `\n\n---\n${canvas.footer}` : ""}\n`,
    [canvas, metadata, notes],
  );
  const payload = () => createCanvasExport(canvas, locale, metadata, notes);

  function download(content: string, type: string, extension: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${canvas.id}_${locale}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus(extension === "md" ? labels["canvas.markdownExported"] : labels["canvas.jsonExported"]);
  }

  function resetImportInput() {
    if (importRef.current) importRef.current.value = "";
  }

  async function importJson(file: File) {
    const value = parseCanvasExport(await file.text(), canvas) as { notes: Record<string, Note[]>; metadata?: Metadata };
    setNotes(value.notes);
    if (value.metadata) setMetadata(value.metadata);
    setStatus(labels["canvas.jsonImported"]);
    resetImportInput();
  }

  const activeSection = canvas.sections.find((section) => section.id === activeSectionId);
  const visibleSections = visibleCanvasSections(canvas.sections, activeSectionId, focusOnly) as CanvasSection[];

  const metadataLabels = {
    title: labels["canvas.metadata"],
    owner: labels["canvas.owner"],
    context: labels["canvas.context"],
    date: labels["canvas.date"],
  };

  return (
    <section className="island-panel workspace">
      <CanvasSystemShell
        mode={presentationMode ? "presentation" : "interactive"}
        fullscreen={presentationMode}
        focusOnly={focusOnly}
        title={canvas.title}
        kicker={labels["canvas.localWorkspace"]}
        description={`${canvas.purpose} ${canvas.howToUse}`}
        toolbar={
          <div className="ds-canvas-toolbar" role="toolbar" aria-label={labels["canvas.localWorkspace"]}>
            {presentationMode ? (
              <button type="button" onClick={() => setPresentationMode(false)}>
                Exit presentation
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setFocusOnly(false);
                    setPresentationMode(true);
                  }}
                >
                  Present canvas
                </button>
                <button type="button" aria-pressed={focusOnly} onClick={() => setFocusOnly((current) => !current)}>
                  {focusOnly ? labels["canvas.showAll"] : labels["canvas.focusSection"]}
                </button>
              </>
            )}
            <button type="button" onClick={() => download(markdown, "text/markdown", "md")}>
              {labels["canvas.exportMarkdown"]}
            </button>
            <button type="button" onClick={() => download(JSON.stringify(payload(), null, 2), "application/json", "json")}>
              {labels["canvas.exportJson"]}
            </button>
            <button type="button" onClick={() => importRef.current?.click()}>
              {labels["canvas.importJson"]}
            </button>
            <input
              ref={importRef}
              hidden
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importJson(file).catch((error: Error) => {
                    setStatus(error.message);
                    resetImportInput();
                  });
                }
              }}
            />
          </div>
        }
        metadata={
          <>
            {presentationMode ? (
              <CanvasSystemMetadataReadOnly metadata={metadata} labels={metadataLabels} />
            ) : (
              <CanvasSystemMetadataEditor metadata={metadata} labels={metadataLabels} onChange={setMetadata} />
            )}
            {canvas.metadata ? (
              <p className="canvas-attribution">
                {[canvas.metadata.source, canvas.metadata.license, ...(canvas.metadata.authors ?? [])].filter(Boolean).join(" \u00b7 ")}
              </p>
            ) : null}
          </>
        }
      >
        <p id={`canvas-${canvas.id}-section-instructions`}>
          {labels["canvas.activeSection"]}: {activeSection?.title}. {labels["canvas.selectSectionInstructions"]}
        </p>
        <div aria-describedby={`canvas-${canvas.id}-section-instructions`}>
          <CanvasSystemGrid columns={canvas.layout.columns} rows={canvas.layout.rows}>
            {visibleSections.map((section) => (
              <CanvasSystemZone
                key={section.id}
                section={section}
                mode={presentationMode ? "presentation" : "interactive"}
                active={section.id === activeSectionId}
                onActivate={presentationMode ? undefined : () => setActiveSectionId(section.id)}
                notes={(notes[section.id] ?? []).map((note, index) => ({ id: `${section.id}:${index}`, text: note.content, color: note.color }))}
                addLabel={labels["canvas.addStickyNote"]}
                deleteLabel={labels["canvas.removeNote"]}
                onNoteChange={(noteId, text) => {
                  const index = Number(noteId.split(":").pop());
                  setNotes((current) => ({
                    ...current,
                    [section.id]: current[section.id].map((item, itemIndex) => (itemIndex === index ? { ...item, content: text } : item)),
                  }));
                }}
                onNoteDelete={(noteId) => {
                  if (!window.confirm(labels["canvas.confirmRemove"])) return;
                  const index = Number(noteId.split(":").pop());
                  setNotes((current) => ({
                    ...current,
                    [section.id]: current[section.id].filter((_, itemIndex) => itemIndex !== index),
                  }));
                }}
                onAddNote={() =>
                  setNotes((current) => ({
                    ...current,
                    [section.id]: [...(current[section.id] ?? []), { content: labels["canvas.newNote"], color: section.defaultNoteColor || "#fff399", size: 80 }],
                  }))
                }
              />
            ))}
          </CanvasSystemGrid>
        </div>
      </CanvasSystemShell>
      <p role="status">{status}</p>
    </section>
  );
}
