import { useEffect } from "react";
import { initializeMethodContext, useMethodContext } from "../../lib/method-context";
import { getStakeholderInvolvement, resolveMethodContext } from "../../lib/resolve-method-context";

export default function CurrentStationInvolvement({ stationId, cycleId, labels }: { stationId: string; cycleId?: string; labels: Record<string, string> }) {
  const context = useMethodContext();
  useEffect(() => { initializeMethodContext(); }, []);
  if (!context.stakeholderId) return null;
  const involvement = getStakeholderInvolvement(context.stakeholderId, stationId);
  const resolved = resolveMethodContext({ ...context, preferredCycleId: cycleId, currentStationId: stationId });
  const detail = involvement ? labels[involvement] : labels.unmapped;
  return <aside className="current-involvement" aria-live="polite"><strong>{involvement ? `${labels.heading}: ${labels[`${involvement}Label`]}` : labels.unmappedHeading}</strong><p>{detail}</p>{resolved.recommendedEntryStationId && resolved.recommendedEntryStationId !== stationId && <a href={`${labels.prefix}/cycles/${resolved.recommendedCycleId}/stations/${resolved.recommendedEntryStationId}`}>{labels.recommended}</a>}</aside>;
}
