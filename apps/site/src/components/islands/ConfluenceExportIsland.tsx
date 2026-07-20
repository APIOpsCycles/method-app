import { useMemo, useState } from "react";

export type ExportTemplate = { id: string; title: string; format: string; body: string };
export default function ConfluenceExportIsland({ entityId, templates, labels }: { locale: string; labels: Record<string, string>; entityId: string; templates: ExportTemplate[] }) {
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const template = templates.find((item) => item.id === selectedId) ?? templates[0];
  const markdown = template?.body ?? "";
  const wiki = useMemo(() => markdown.replace(/^### (.+)$/gm, "h3. $1").replace(/^## (.+)$/gm, "h2. $1").replace(/^# (.+)$/gm, "h1. $1").replace(/^[-*] /gm, "* ").replace(/\*\*(.+?)\*\*/g, "*$1*"), [markdown]);
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setStatus(labels["clipboard.copied"]); } catch { setStatus(labels["clipboard.failed"]); } }
  return <section className="island-panel" aria-labelledby={`exports-${entityId}`}><p className="public-kicker">{labels["exports.publishing"]}</p><h2 id={`exports-${entityId}`}>{labels["exports.title"]}</h2><p>Use Markdown for repositories and static sites, or Confluence-wiki markup for compatible Confluence pages.</p>
    {template ? <><label className="island-field">{labels["exports.purpose"]}<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{templates.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><div className="export-grid"><article><h3>{labels["confluence.markdown"]}</h3><pre>{markdown}</pre><button className="is-button" type="button" onClick={() => void copy(markdown)}>{labels["confluence.copyMarkdown"]}</button></article><article><h3>{labels["confluence.confluenceWiki"]}</h3><pre>{wiki}</pre><button className="is-button" type="button" onClick={() => void copy(wiki)}>{labels["confluence.copyConfluenceWiki"]}</button></article></div><p role="status">{status}</p></> : <p>{labels["exports.empty"]}</p>}
  </section>;
}
