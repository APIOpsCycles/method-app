import { useEffect, useRef, useState } from "react";
import { dismissContextPrompt, initializeMethodContext, isContextPromptDismissed, resetMethodContext, setMethodContext, useMethodContext } from "../../lib/method-context";
import { ContextGuidance, MethodContextBar, MethodContextEditor, type MethodContextItem } from "@apiops/design-system/react";

type Option = { id: string; label: string };
export default function MethodContextStrip({ stakeholders, goals, cycle, here, labels }: { stakeholders: Option[]; goals: Option[]; cycle?: { label: string; href: string }; here: { label: string }; labels: Record<string, string> }) {
  const context = useMethodContext();
  const [editing, setEditing] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const changeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => { initializeMethodContext(); setDismissed(isContextPromptDismissed()); }, []);
  const stakeholder = stakeholders.find((item) => item.id === context.stakeholderId)?.label;
  const goal = goals.find((item) => item.id === context.goalId)?.label;
  const noContext = !stakeholder && !goal;
  const close = () => { setEditing(false); requestAnimationFrame(() => changeButton.current?.focus()); };
  const items: MethodContextItem[] = [{ id: "stakeholder", label: labels.viewAs, value: stakeholder ?? labels.notSelected, muted: !stakeholder }, { id: "goal", label: labels.goal, value: goal ?? labels.notSelected, muted: !goal }, ...(cycle ? [{ id: "cycle" as const, label: labels.cycle, value: cycle.label, href: cycle.href }] : []), { id: "here", label: labels.here, value: here.label }];
  return <section className="method-context-surface" aria-label={labels.context}>
    <MethodContextBar items={items} expanded={editing} changeLabel={labels.change} closeLabel={labels.close} toggleRef={changeButton} onToggle={() => editing ? close() : setEditing(true)} />
    {noContext && !editing && !dismissed && <aside className="method-context-setup" aria-labelledby="context-setup-title"><ContextGuidance tone="neutral" title={labels.findPath}>{labels.setupHelp}</ContextGuidance><div><button type="button" className="is-button" onClick={() => setEditing(true)}>{labels.choosePerspective}</button><button type="button" className="context-link" onClick={() => { dismissContextPrompt(); setDismissed(true); }}>{labels.dismiss}</button></div></aside>}
    {editing && <MethodContextEditor><label><span>{labels.viewAs}</span><select autoFocus value={context.stakeholderId ?? ""} onChange={(event) => setMethodContext({ stakeholderId: event.target.value || undefined })}><option value="">{labels.selectStakeholder}</option>{stakeholders.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span>{labels.goal}</span><select value={context.goalId ?? ""} onChange={(event) => setMethodContext({ goalId: event.target.value || undefined })}><option value="">{labels.selectGoal}</option>{goals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div><button type="button" className="context-link" onClick={() => resetMethodContext()}>{labels.reset}</button><button type="button" className="is-button" onClick={close}>{labels.done}</button></div></MethodContextEditor>}
  </section>;
}
