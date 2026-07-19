import { useState } from "react";

export type ViewerResource = { id: string; title: string; description: string; category: string; outcomes: string[]; steps: string[]; contentMarkdown?: string | null; sourceUrl?: string | null };

export default function ResourceViewerIsland({ stationId, stationTitle, resources }: { locale: string; stationId: string; stationTitle: string; resources: ViewerResource[] }) {
  const [selectedId, setSelectedId] = useState(resources[0]?.id ?? "");
  const [expanded, setExpanded] = useState(false);
  const resource = resources.find((item) => item.id === selectedId) ?? resources[0];
  return <section className="island-panel" aria-labelledby={`resources-${stationId}`}>
    <p className="public-kicker">Station resources</p><h2 id={`resources-${stationId}`}>Resources for {stationTitle}</h2>
    {resources.length ? <><label className="island-field">Choose a resource<select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setExpanded(false); }}>{resources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      {resource && <article className="resource-view"><p className="public-kicker">{resource.category}</p><h3>{resource.title}</h3><p>{resource.description}</p>
        {resource.outcomes.length > 0 && <><h4>Expected outcomes</h4><ul>{resource.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {resource.steps.length > 0 && <><h4>How to use it</h4><ol>{resource.steps.map((item) => <li key={item}>{item}</li>)}</ol></>}
        {resource.contentMarkdown && <><button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Hide" : "Expand"} source content</button>{expanded && <pre className="source-content">{resource.contentMarkdown}</pre>}</>}
        {resource.sourceUrl && <p><a href={resource.sourceUrl}>View original source</a></p>}
      </article>}
    </> : <p>No downloadable resources are currently linked to this station.</p>}
  </section>;
}
