import { useEffect, useRef, useState } from "react";
import { dismissContextPrompt, initializeMethodContext, isContextPromptDismissed, resetMethodContext, setMethodContext, useMethodContext } from "../../lib/method-context";
import { resolveContextualUiState, resolveMethodContext } from "../../lib/resolve-method-context";
import { ContextGuidance, MethodContextBar, MethodContextEditor, type MethodContextItem } from "@apiops/design-system/react";
import type { PageMethodContext } from "../../lib/method-graph";

type Option = { id: string; label: string };
type ContextCycle = Option & { slug: string; stations: Option[] };
type ContextLine = Option & { slug: string; stationIds: string[]; color: string };
export default function MethodContextStrip({ stakeholders, goals, cycles, lines, pageContext, prefix, here, labels }: { stakeholders: Option[]; goals: Option[]; cycles: ContextCycle[]; lines: ContextLine[]; pageContext?: PageMethodContext; prefix: string; here: string; labels: Record<string, string> }) {
  const cycleId = pageContext?.explicitCycleId ?? (pageContext?.entityType === "cycle" ? pageContext.entityId : undefined);
  const lineId = pageContext?.entityType === "line" ? pageContext.entityId : pageContext?.lineIds[0];
  const stationId = pageContext?.currentStationId;
  const contextStationIds = pageContext?.stationIds;
  const context = useMethodContext();
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const changeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { initializeMethodContext(); setDismissed(isContextPromptDismissed()); }, []);
  const stakeholder = stakeholders.find((item) => item.id === context.stakeholderId)?.label;
  const goal = goals.find((item) => item.id === context.goalId)?.label;
  const routeCycle = cycles.find((item) => item.id === cycleId);
  const noContext = !stakeholder && !goal;
  const close = () => { setEditing(false); requestAnimationFrame(() => changeButton.current?.focus()); };
  const resolved = resolveMethodContext({ ...context, preferredCycleId: cycleId, currentStationId: stationId, contextStationIds });
  const contextualUi = resolveContextualUiState(resolved);
  const resolvedCycleId = contextualUi.pageMode === "on-path" ? resolved.currentCycleId : resolved.recommendedCycleId;
  const resolvedCycle = cycles.find((item) => item.id === resolvedCycleId);
  const displayCycle = routeCycle ?? cycles.find((item) => item.id === resolved.recommendedCycleId);
  const actionStationId = contextualUi.primaryStationId;
  const actionStation = resolvedCycle?.stations.find((item) => item.id === actionStationId);
  const displayLine = lines.find((item) => item.id === lineId) ?? lines.find((item) => item.stationIds.includes(stationId ?? actionStationId ?? ""));
  const actionHref = resolvedCycle && actionStation ? `${prefix}/cycles/${resolvedCycle.slug}/stations/${actionStation.id}` : undefined;
  const involvement = stationId ? resolved.stationInvolvement[stationId] : undefined;
  const involvementDetail = involvement ? labels[`involvement${involvement[0].toUpperCase()}${involvement.slice(1)}`] : labels.involvementUnmapped;
  const items: MethodContextItem[] = [
    { id: "stakeholder", label: labels.who, value: stakeholder ?? labels.notSelected, muted: !stakeholder },
    { id: "goal", label: labels.why, value: goal ?? labels.notSelected, muted: !goal },
    { id: "here", label: labels.where, value: here },
    { id: "cycle", label: labels.cycle, value: displayCycle?.label ?? labels.notSelected, href: displayCycle ? `${prefix}/cycles/${displayCycle.slug}` : undefined, muted: !displayCycle, detail: displayLine ? { value: displayLine.label, color: displayLine.color } : undefined },
  ];
  const hasNext = Boolean(contextualUi.nextRelevantStationId);
  const guidanceTitle = involvement ? `${labels[involvement]}: ${involvementDetail}` : contextualUi.pageMode === "off-path" ? labels.offPath : contextualUi.pageMode === "explore" ? labels.where : hasNext ? labels.onPath : labels.recommended;
  const actionPrefix = hasNext ? labels.next : contextualUi.pageMode === "start" ? undefined : labels.recommended;
  const guidance = !noContext && (stationId || actionStation) ? <ContextGuidance tone={contextualUi.pageMode === "off-path" ? "warning" : "success"} title={guidanceTitle}>
    {contextualUi.pageMode === "off-path" ? <>{involvement ? labels.offPath : null}{involvement && actionStation && actionHref ? <br /> : null}{actionStation && actionHref ? <>{labels.recommended}: <a href={actionHref}>{actionStation.label}</a></> : null}</> : <>{involvement ? <strong>{labels.onPath}</strong> : null}{involvement && actionStation && actionHref ? <br /> : null}{actionStation && actionHref ? <>{actionPrefix ? `${actionPrefix}: ` : null}<a href={actionHref}>{actionStation.label}</a></> : null}</>}
  </ContextGuidance> : null;
  return <section className="method-context-surface" aria-label={labels.context}>
    <MethodContextBar items={items} expanded={editing} changeLabel={labels.change} closeLabel={labels.close} toggleRef={changeButton} onToggle={() => editing ? close() : setEditing(true)} />
    {guidance && <div className="method-context-guidance">{guidance}</div>}
    {noContext && !editing && !dismissed && <aside className="method-context-setup" aria-labelledby="context-setup-title"><ContextGuidance tone="neutral" title={labels.findPath}>{labels.setupHelp}</ContextGuidance><div><button type="button" className="is-button" onClick={() => setEditing(true)}>{labels.choosePerspective}</button><button type="button" className="context-link" onClick={() => { dismissContextPrompt(); setDismissed(true); }}>{labels.dismiss}</button></div></aside>}
    {editing && <MethodContextEditor><label><span>{labels.who}</span><select autoFocus value={context.stakeholderId ?? ""} onChange={(event) => setMethodContext({ stakeholderId: event.target.value || undefined })}><option value="">{labels.selectStakeholder}</option>{stakeholders.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span>{labels.why}</span><select value={context.goalId ?? ""} onChange={(event) => setMethodContext({ goalId: event.target.value || undefined })}><option value="">{labels.selectGoal}</option>{goals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div><button type="button" className="context-link" onClick={() => resetMethodContext()}>{labels.reset}</button><button type="button" className="is-button" onClick={close}>{labels.done}</button></div></MethodContextEditor>}
  </section>;
}
