import type { Involvement } from "../../lib/method-graph";
import { ContextGuidance } from "@apiops/design-system/react";

export default function RecommendedStart({ station, cycle, involvement, reasons, href, tone, labels }: { station: string; cycle: string; involvement?: Involvement; reasons: string[]; href: string; tone: "success" | "warning" | "neutral"; labels: Record<string, string> }) {
  return <div className="recommended-start"><ContextGuidance tone={tone} title={labels.kicker}><strong id="recommended-start-title">{station}</strong> · {cycle}. {reasons.join(" ")} {involvement === "consulted" ? labels.consulted : ""}</ContextGuidance><a className="is-button" href={href}>{labels.action}</a></div>;
}
