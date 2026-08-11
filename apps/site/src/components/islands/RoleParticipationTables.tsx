import { useEffect } from "react";
import { RoleParticipationTable, type RoleParticipationRow } from "apiops-design-system/react";
import { initializeMethodContext, useMethodContext } from "../../lib/method-context";
import { resolveMethodContext } from "../../lib/resolve-method-context";

type CycleParticipation = {
  id: string;
  title: string;
  href: string;
  rows: RoleParticipationRow[];
};

export default function RoleParticipationTables({ roleId, cycles, labels }: {
  roleId: string;
  cycles: CycleParticipation[];
  labels: { station: string; involvement: string; resources: string; noResources: string };
}) {
  const context = useMethodContext();
  useEffect(() => { initializeMethodContext(); }, []);
  const hasContext = Boolean(context.stakeholderId || context.goalId);
  const resolved = resolveMethodContext({ stakeholderId: roleId, goalId: context.goalId });
  const contextualCycle = hasContext ? cycles.find((cycle) => cycle.id === resolved.recommendedCycleId) : undefined;
  const visibleCycles = contextualCycle ? [contextualCycle] : cycles;

  return <>{visibleCycles.map((cycle) => <RoleParticipationTable key={cycle.id} cycle={cycle} rows={cycle.rows} labels={labels} />)}</>;
}
