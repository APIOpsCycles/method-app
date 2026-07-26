import { useEffect, useRef, useState } from "react";
import { dismissContextPrompt, initializeMethodContext, isContextPromptDismissed, resetMethodContext, setMethodContext, useMethodContext } from "../../lib/method-context";
import { resolveContextualUiState, resolveMethodContext } from "../../lib/resolve-method-context";
import { ContextGuidance, MethodContextBar, MethodContextEditor, type MethodContextItem } from "@apiops/design-system/react";

type Option = { id: string; label: string };
type ContextCycle = Option & { slug: string; stations: Option[] };
export default function MethodContextStrip({ stakeholders, goals, cycles, cycleId, stationId, prefix, here, labels }: { stakeholders: Option[]; goals: Option[]; cycles: ContextCycle[]; cycleId?: string; stationId?: string; prefix: string; here: string; labels: Record<string, string> }) {
  const context = useMethodContext();
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const changeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { initializeMethodContext(); setDismissed(isContextPromptDismissed()); }, []);
  const stakeholder = stakeholders.find((item) => item.id === context.stakeholderId)?.label;
  const goal = goals.find((item) => item.id === context.goalId)?.label;
  const cycle = cycles.find((item) => item.id === cycleId);
  const noContext = !stakeholder && !goal;
  const close = () => { setEditing(false); requestAnimationFrame(() => changeButton.current?.focus()); };
  const resolved = resolveMethodContext({ ...context, preferredCycleId: cycleId, currentStationId: stationId });
  const contextualUi = resolveContextualUiState(resolved);
  const resolvedCycleId = contextualUi.pageMode === "on-path" ? resolved.currentCycleId : resolved.recommendedCycleId;
  const resolvedCycle = cycles.find((item) => item.id === resolvedCycleId);
  const actionStationId = contextualUi.primaryStationId;
  const actionStation = resolvedCycle?.stations.find((item) => item.id === actionStationId);
  const actionHref = resolvedCycle && actionStation ? `${prefix}/cycles/${resolvedCycle.slug}/stations/${actionStation.id}` : undefined;
  const involvement = stationId ? resolved.stationInvolvement[stationId] : undefined;
  const involvementDetail = involvement ? labels[`involvement${involvement[0].toUpperCase()}${involvement.slice(1)}`] : labels.involvementUnmapped;
  const items: MethodContextItem[] = [
    { id: "stakeholder", label: labels.who, value: stakeholder ?? labels.notSelected, muted: !stakeholder },
    { id: "goal", label: labels.why, value: goal ?? labels.notSelected, muted: !goal },
    { id: "here", label: labels.where, value: here },
    { id: "cycle", label: labels.cycle, value: cycle?.label ?? labels.notSelected, href: cycle ? `${prefix}/cycles/${cycle.slug}` : undefined, muted: !cycle },
  ];
  const guidance = !noContext && (stationId || actionStation) ? <ContextGuidance tone={contextualUi.pageMode === "off-path" ? "warning" : "success"} title={involvement ? `${labels[involvement]}: ${involvementDetail}` : contextualUi.pageMode === "off-path" ? labels.offPath : contextualUi.pageMode === "start" ? labels.recommended : labels.onPath}>
    {contextualUi.pageMode === "on-path" ? <>{involvement ? <strong>{labels.onPath}</strong> : null}{involvement && actionStation && actionHref ? <br /> : null}{actionStation && actionHref ? <>{labels.next}: <a href={actionHref}>{actionStation.label}</a></> : null}</> : contextualUi.pageMode === "off-path" ? <>{involvement ? labels.offPath : null}{involvement && actionStation && actionHref ? <br /> : null}{actionStation && actionHref ? <>{labels.recommended}: <a href={actionHref}>{actionStation.label}</a></> : null}</> : actionStation && actionHref ? <>{labels.recommended}: <a href={actionHref}>{actionStation.label}</a></> : null}
  </ContextGuidance> : null;
  return <section className="method-context-surface" aria-label={labels.context}>
    <MethodContextBar items={items} expanded={editing} changeLabel={labels.change} closeLabel={labels.close} toggleRef={changeButton} onToggle={() => editing ? close() : setEditing(true)} />
    {guidance && <div className="method-context-guidance">{guidance}</div>}
    {noContext && !editing && !dismissed && <aside className="method-context-setup" aria-labelledby="context-setup-title"><ContextGuidance tone="neutral" title={labels.findPath}>{labels.setupHelp}</ContextGuidance><div><button type="button" className="is-button" onClick={() => setEditing(true)}>{labels.choosePerspective}</button><button type="button" className="context-link" onClick={() => { dismissContextPrompt(); setDismissed(true); }}>{labels.dismiss}</button></div></aside>}
    {editing && <MethodContextEditor><label><span>{labels.who}</span><select autoFocus value={context.stakeholderId ?? ""} onChange={(event) => setMethodContext({ stakeholderId: event.target.value || undefined })}><option value="">{labels.selectStakeholder}</option>{stakeholders.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span>{labels.why}</span><select value={context.goalId ?? ""} onChange={(event) => setMethodContext({ goalId: event.target.value || undefined })}><option value="">{labels.selectGoal}</option>{goals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div><button type="button" className="context-link" onClick={() => resetMethodContext()}>{labels.reset}</button><button type="button" className="is-button" onClick={close}>{labels.done}</button></div></MethodContextEditor>}
  </section>;
}
