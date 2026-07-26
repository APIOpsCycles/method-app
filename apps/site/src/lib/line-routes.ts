import { methodGraph, type UserMethodContext } from "./method-graph";
import { resolveMethodContext } from "./resolve-method-context";

type LineCycle = { id: string; slug: string };

/**
 * Preserve a user's selected method perspective when opening a line. Without
 * a perspective (or when its cycle does not intersect the line), the neutral
 * canonical route remains the safe destination.
 */
export function linePathForContext(prefix: string, line: { id: string; slug: string }, cycles: LineCycle[], context: UserMethodContext) {
  const genericPath = `${prefix}/lines/${line.slug}`;
  if (!context.stakeholderId && !context.goalId) return genericPath;
  const cycleId = resolveMethodContext(context).recommendedCycleId;
  if (!cycleId || !methodGraph.byLine[line.id]?.cycleIds.includes(cycleId)) return genericPath;
  const cycle = cycles.find((candidate) => candidate.id === cycleId);
  return cycle ? `${prefix}/cycle/${cycle.slug}/lines/${line.slug}` : genericPath;
}
