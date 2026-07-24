import { useEffect, useRef, useState } from "react";
import { dismissContextPrompt, initializeMethodContext, isContextPromptDismissed, resetMethodContext, setMethodContext, useMethodContext } from "../../lib/method-context";

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
  if (noContext && !editing && !dismissed) return <aside className="method-context-setup" aria-labelledby="context-setup-title"><div><strong id="context-setup-title">{labels.findPath}</strong><p>{labels.setupHelp}</p></div><button type="button" className="is-button" onClick={() => setEditing(true)}>{labels.choosePerspective}</button><button type="button" className="context-link" onClick={() => { dismissContextPrompt(); setDismissed(true); }}>{labels.dismiss}</button></aside>;
  return <section className="method-context-surface" aria-label={labels.context}>
    <div className="method-context-strip">
      <span><small>{labels.viewAs}</small><strong>{stakeholder ?? labels.notSelected}</strong></span>
      <span><small>{labels.goal}</small><strong>{goal ?? labels.notSelected}</strong></span>
      {cycle && <a href={cycle.href}><small>{labels.cycle}</small><strong>{cycle.label}</strong></a>}
      <span><small>{labels.here}</small><strong>{here.label}</strong></span>
      <button ref={changeButton} type="button" aria-expanded={editing} aria-controls="method-context-editor" onClick={() => editing ? close() : setEditing(true)}>{editing ? labels.close : labels.change}</button>
    </div>
    {editing && <div id="method-context-editor" className="method-context-editor"><label><span>{labels.viewAs}</span><select autoFocus value={context.stakeholderId ?? ""} onChange={(event) => setMethodContext({ stakeholderId: event.target.value || undefined })}><option value="">{labels.selectStakeholder}</option>{stakeholders.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label><span>{labels.goal}</span><select value={context.goalId ?? ""} onChange={(event) => setMethodContext({ goalId: event.target.value || undefined })}><option value="">{labels.selectGoal}</option>{goals.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div><button type="button" className="context-link" onClick={() => resetMethodContext()}>{labels.reset}</button><button type="button" className="is-button" onClick={close}>{labels.done}</button></div></div>}
  </section>;
}
