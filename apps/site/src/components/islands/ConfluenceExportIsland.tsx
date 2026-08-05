import { useMemo, useState } from "react";

export type ExportTemplate = { id: string; title: string; kind?: string; format: string; body: string };
type ExportPurpose = { id: string; title: string; markdown: string; wiki: string };

const purposeKey = (template: ExportTemplate) => template.kind ?? template.id.replace(/-(markdown|confluence-wiki)$/, "");
const purposeTitle = (template: ExportTemplate) => template.title.replace(/\s+(Markdown|Confluence wiki)$/i, "");
const markdownToWiki = (markdown: string) =>
  markdown
    .replace(/^#### (.+)$/gm, "h4. $1")
    .replace(/^### (.+)$/gm, "h3. $1")
    .replace(/^## (.+)$/gm, "h2. $1")
    .replace(/^# (.+)$/gm, "h1. $1")
    .replace(/^[-*] /gm, "* ")
    .replace(/\*\*(.+?)\*\*/g, "*$1*");

export function groupPurposes(templates: ExportTemplate[]): ExportPurpose[] {
  const grouped = new Map<string, { title: string; markdown?: string; wiki?: string }>();
  for (const template of templates) {
    const id = purposeKey(template);
    const current = grouped.get(id) ?? { title: purposeTitle(template) };
    if (template.format === "confluence-wiki") current.wiki = template.body;
    else if (template.format === "markdown") current.markdown = template.body;
    else current.markdown ??= template.body;
    grouped.set(id, current);
  }
  return [...grouped].map(([id, group]) => {
    const markdown = group.markdown ?? group.wiki ?? "";
    return { id, title: group.title, markdown, wiki: group.wiki ?? markdownToWiki(markdown) };
  });
}

export default function ConfluenceExportIsland({ entityId, templates, labels }: { locale: string; labels: Record<string, string>; entityId: string; templates: ExportTemplate[] }) {
  const purposes = useMemo(() => groupPurposes(templates), [templates]);
  const [selectedId, setSelectedId] = useState(purposes[0]?.id ?? "");
  const [status, setStatus] = useState("");
  const purpose = purposes.find((item) => item.id === selectedId) ?? purposes[0];
  const markdown = purpose?.markdown ?? "";
  const wiki = purpose?.wiki ?? "";
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setStatus(labels["clipboard.copied"]); } catch { setStatus(labels["clipboard.failed"]); } }
  return <section className="island-panel" aria-labelledby={`exports-${entityId}`}><p className="public-kicker">{labels["exports.publishing"]}</p><h2 id={`exports-${entityId}`}>{labels["exports.title"]}</h2><p>Use Markdown for repositories and static sites, or Confluence-wiki markup for compatible Confluence pages.</p>
    {purpose ? <><label className="island-field">{labels["exports.purpose"]}<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{purposes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><div className="export-grid"><article><h3>{labels["confluence.markdown"]}</h3><pre>{markdown}</pre><button className="is-button" type="button" onClick={() => void copy(markdown)}>{labels["confluence.copyMarkdown"]}</button></article><article><h3>{labels["confluence.confluenceWiki"]}</h3><pre>{wiki}</pre><button className="is-button" type="button" onClick={() => void copy(wiki)}>{labels["confluence.copyConfluenceWiki"]}</button></article></div><p role="status">{status}</p></> : <p>{labels["exports.empty"]}</p>}
  </section>;
}
