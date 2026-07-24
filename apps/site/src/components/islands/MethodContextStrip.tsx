import { useEffect } from "react";
import { initializeMethodContext, resetMethodContext, useMethodContext } from "../../lib/method-context";

type Option = { id: string; label: string };
export default function MethodContextStrip({ stakeholders, goals, cycle, here, labels }: { stakeholders: Option[]; goals: Option[]; cycle?: { label: string; href: string }; here: { label: string }; labels: Record<string, string> }) {
  const context = useMethodContext();
  useEffect(() => { initializeMethodContext(); }, []);
  const stakeholder = stakeholders.find((item) => item.id === context.stakeholderId)?.label;
  const goal = goals.find((item) => item.id === context.goalId)?.label;
  return <nav className="method-context-strip" aria-label={labels.context}>
    <span><small>{labels.viewAs}</small><strong>{stakeholder ?? labels.notSelected}</strong></span>
    <span><small>{labels.goal}</small><strong>{goal ?? labels.notSelected}</strong></span>
    {cycle && <a href={cycle.href}><small>{labels.cycle}</small><strong>{cycle.label}</strong></a>}
    <span><small>{labels.here}</small><strong>{here.label}</strong></span>
    {(stakeholder || goal) && <button type="button" onClick={() => resetMethodContext()}>{labels.reset}</button>}
  </nav>;
}
