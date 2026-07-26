import { useState } from "react";
import type { LabelSubset } from "../../lib/method-data";

type ResourceViewerLabels = LabelSubset<"resources.stationKicker" | "resources.forStation" | "resources.choose" | "section.outcomes" | "section.howToUse" | "resources.collapse" | "resources.expand" | "resources.viewSource" | "resources.emptyLinked">;

export type ViewerResource = { id: string; title: string; description: string; category: string; outcomes: string[]; steps: string[]; contentMarkdown?: string | null; sourceUrl?: string | null };

export default function ResourceViewerIsland({ stationId, stationTitle, resources, labels }: { labels: ResourceViewerLabels; stationId: string; stationTitle: string; resources: ViewerResource[] }) {
  const [selectedId, setSelectedId] = useState(resources[0]?.id ?? "");
  const [expanded, setExpanded] = useState(false);
  const resource = resources.find((item) => item.id === selectedId) ?? resources[0];
  return <section className="island-panel" aria-labelledby={`resources-${stationId}`}>
    <p className="public-kicker">{labels["resources.stationKicker"]}</p><h2 id={`resources-${stationId}`}>{labels["resources.forStation"].replace("{station}", stationTitle)}</h2>
    {resources.length ? <><label className="island-field">{labels["resources.choose"]}<select value={selectedId} onChange={(event) => { setSelectedId(event.target.value); setExpanded(false); }}>{resources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      {resource && <article className="resource-view"><p className="public-kicker">{resource.category}</p><h3>{resource.title}</h3><p>{resource.description}</p>
        {resource.outcomes.length > 0 && <><h4>{labels["section.outcomes"]}</h4><ul>{resource.outcomes.map((item) => <li key={item}>{item}</li>)}</ul></>}
        {resource.steps.length > 0 && <><h4>{labels["section.howToUse"]}</h4><ol>{resource.steps.map((item) => <li key={item}>{item}</li>)}</ol></>}
        {resource.contentMarkdown && <><button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? labels["resources.collapse"] : labels["resources.expand"]}</button>{expanded && <pre className="source-content">{resource.contentMarkdown}</pre>}</>}
        {resource.sourceUrl && <p><a href={resource.sourceUrl}>{labels["resources.viewSource"]}</a></p>}
      </article>}
    </> : <p>{labels["resources.emptyLinked"]}</p>}
  </section>;
}
