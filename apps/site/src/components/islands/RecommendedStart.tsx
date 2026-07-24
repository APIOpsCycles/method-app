import type { Involvement } from "../../lib/method-graph";

export default function RecommendedStart({ station, cycle, involvement, reasons, href, labels }: { station: string; cycle: string; involvement?: Involvement; reasons: string[]; href: string; labels: Record<string, string> }) {
  return <aside className="recommended-start" aria-labelledby="recommended-start-title"><div><small>{labels.kicker}</small><h3 id="recommended-start-title">{station}</h3><p><strong>{labels.cycle}:</strong> {cycle}</p><p>{reasons.join(" ")}</p>{involvement === "consulted" && <p>{labels.consulted}</p>}</div><a className="is-button" href={href}>{labels.action}</a></aside>;
}
