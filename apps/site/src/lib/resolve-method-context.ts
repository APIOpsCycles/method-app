import { methodGraph, type Involvement, type MethodGraph, type UserMethodContext } from "./method-graph";

export const INVOLVEMENT_WEIGHT = { lead: 30, core: 20, consulted: 10, unmapped: 0 } as const;
export const CYCLE_SCORE = { goalCycle: 100, goalStation: 60, stakeholderUnmapped: -50 } as const;

export type ResolveContextInput = UserMethodContext & { preferredCycleId?: string; currentStationId?: string; contextStationIds?: string[] };
export type ResolvedMethodContext = UserMethodContext & {
  recommendedCycleId?: string;
  recommendedEntryStationId?: string;
  eligibleCycleIds: string[];
  relevantStationIds: string[];
  /** Stations that form the selected perspective's path. */
  pathStationIds: string[];
  stationInvolvement: Record<string, Involvement | undefined>;
  currentCycleId?: string;
  currentStationId?: string;
  contextStationIds: string[];
  isCurrentCycleRecommended: boolean;
  isCurrentStationRelevant: boolean;
  explanation: { cycleReasons: string[]; stationReasons: string[] };
};
export type ContextualPageMode = "no-context" | "start" | "on-path" | "off-path" | "explore";
export type ContextualUiState = { pageMode: ContextualPageMode; involvement?: Involvement; nextRelevantStationId?: string; primaryStationId?: string };

const involvementAt = (graph: MethodGraph, stakeholderId: string | undefined, stationId: string) =>
  stakeholderId ? graph.byStation[stationId as keyof typeof graph.byStation]?.stakeholders.find((item) => item.id === stakeholderId)?.involvement as Involvement | undefined : undefined;

export function getStakeholderInvolvement(stakeholderId: string | undefined, stationId: string, graph: MethodGraph = methodGraph) { return involvementAt(graph, stakeholderId, stationId); }

export function scoreCycleForContext(cycleId: string, input: ResolveContextInput, graph: MethodGraph = methodGraph) {
  const cycle = graph.byCycle[cycleId as keyof typeof graph.byCycle];
  if (!cycle) return Number.NEGATIVE_INFINITY;
  const goal = input.goalId ? graph.byGoal[input.goalId as keyof typeof graph.byGoal] : undefined;
  const involvement = cycle.stationIds.map((id) => involvementAt(graph, input.stakeholderId, id)).filter(Boolean) as Involvement[];
  const strongest = involvement.reduce((weight, value) => Math.max(weight, INVOLVEMENT_WEIGHT[value]), 0);
  let score = goal?.recommendedCycleIds.includes(cycleId) ? CYCLE_SCORE.goalCycle : 0;
  if (goal?.stationIds.some((id) => cycle.stationIds.includes(id))) score += CYCLE_SCORE.goalStation;
  if (input.stakeholderId) score += involvement.length ? strongest : CYCLE_SCORE.stakeholderUnmapped;
  return score;
}

export function resolveMethodContext(input: ResolveContextInput, graph: MethodGraph = methodGraph): ResolvedMethodContext {
  const stakeholderId = input.stakeholderId && graph.byStakeholder[input.stakeholderId as keyof typeof graph.byStakeholder] ? input.stakeholderId : undefined;
  const goalId = input.goalId && graph.byGoal[input.goalId as keyof typeof graph.byGoal] ? input.goalId : undefined;
  const clean = { ...input, stakeholderId, goalId };
  const stationInvolvement = Object.fromEntries(Object.keys(graph.byStation).map((id) => [id, involvementAt(graph, stakeholderId, id)]));
  const goalStations = goalId ? graph.byGoal[goalId as keyof typeof graph.byGoal].stationIds : [];
  const stakeholderStations = stakeholderId ? graph.byStakeholder[stakeholderId as keyof typeof graph.byStakeholder].stationIds : [];
  const relevantStationIds = [...new Set([...goalStations, ...stakeholderStations])];
  // A goal chooses and scores the journey cycle, while the stakeholder
  // mapping defines their stops within that journey. Goal-only stations still
  // receive map emphasis but are not presented as role-relevant path stops.
  const pathStationIds = stakeholderId ? stakeholderStations : goalStations;
  const cycleIds = Object.keys(graph.byCycle);
  const eligibleCycleIds = (stakeholderId || goalId) ? cycleIds.filter((id) => {
    const cycle = graph.byCycle[id as keyof typeof graph.byCycle];
    return (goalId && (graph.byGoal[goalId as keyof typeof graph.byGoal].recommendedCycleIds.includes(id) || goalStations.some((station) => cycle.stationIds.includes(station)))) || stakeholderStations.some((station) => cycle.stationIds.includes(station));
  }) : [];
  const recommendedCycleId = eligibleCycleIds.map((id, order) => ({ id, order, score: scoreCycleForContext(id, clean, graph) })).sort((a, b) => b.score - a.score || a.order - b.order)[0]?.id;
  const cycleStations = recommendedCycleId ? graph.byCycle[recommendedCycleId as keyof typeof graph.byCycle].stationIds : [];
  const rankedStations = cycleStations.map((id, order) => {
    const involvement = stationInvolvement[id];
    const goalMatch = goalStations.includes(id);
    // Both dimensions dominate either dimension; within each group role
    // involvement ranks lead > core > consulted, then canonical journey order.
    const group = goalMatch && involvement ? 3 : involvement ? 2 : goalMatch ? 1 : 0;
    return { id, order, score: group * 100 + (involvement ? INVOLVEMENT_WEIGHT[involvement] : 0) };
  });
  const recommendedEntryStationId = (stakeholderId || goalId) ? rankedStations.sort((a, b) => b.score - a.score || a.order - b.order)[0]?.id : undefined;
  const currentCycleId = input.preferredCycleId && graph.byCycle[input.preferredCycleId as keyof typeof graph.byCycle] ? input.preferredCycleId : input.currentStationId ? cycleIds.find((id) => graph.byCycle[id as keyof typeof graph.byCycle].stationIds.includes(input.currentStationId!)) : undefined;
  const entryInvolvement = recommendedEntryStationId ? stationInvolvement[recommendedEntryStationId] : undefined;
  const cycleReasons = recommendedCycleId ? [goalId && graph.byGoal[goalId as keyof typeof graph.byGoal].recommendedCycleIds.includes(recommendedCycleId) ? "The selected goal directly recommends this cycle." : "This cycle contains work mapped to the selected perspective."].filter(Boolean) as string[] : [];
  const stationReasons = recommendedEntryStationId ? [entryInvolvement ? `Your involvement at this station is ${entryInvolvement}.` : "This station directly supports the selected goal.", goalStations.includes(recommendedEntryStationId) && entryInvolvement ? "It also directly supports the selected goal." : ""].filter(Boolean) : [];
  const isCurrentCycleRecommended = Boolean(currentCycleId && currentCycleId === recommendedCycleId);
  const contextStationIds = [...new Set(input.contextStationIds ?? [])].filter((id) => Boolean(graph.byStation[id]));
  return { stakeholderId, goalId, recommendedCycleId, recommendedEntryStationId, eligibleCycleIds, relevantStationIds, pathStationIds, stationInvolvement, currentCycleId, currentStationId: input.currentStationId, contextStationIds, isCurrentCycleRecommended, isCurrentStationRelevant: Boolean(input.currentStationId && pathStationIds.includes(input.currentStationId) && (!currentCycleId || isCurrentCycleRecommended)), explanation: { cycleReasons, stationReasons } };
}

export function resolveContextualUiState(resolved: ResolvedMethodContext, graph: MethodGraph = methodGraph): ContextualUiState {
  if (!resolved.stakeholderId && !resolved.goalId) return { pageMode: "no-context" };
  if (!resolved.currentStationId) {
    if (resolved.currentCycleId && !resolved.isCurrentCycleRecommended) return { pageMode: "off-path", primaryStationId: resolved.recommendedEntryStationId };
    const stations = resolved.recommendedCycleId ? graph.byCycle[resolved.recommendedCycleId]?.stationIds ?? [] : [];
    // Entity pages lead to the first place the entity is useful on the
    // selected role's path, rather than to an earlier station where that role
    // has no mapped involvement. With goal-only context, pathStationIds is the
    // goal path and follows the same rule.
    const contextualStationId = stations.find((id) => resolved.contextStationIds.includes(id) && resolved.pathStationIds.includes(id));
    if (contextualStationId) return { pageMode: "explore", primaryStationId: contextualStationId };
    return { pageMode: "start", primaryStationId: resolved.recommendedEntryStationId };
  }
  const involvement = resolved.stationInvolvement[resolved.currentStationId];
  if (!resolved.isCurrentStationRelevant) return { pageMode: "off-path", involvement, primaryStationId: resolved.recommendedEntryStationId };
  const cycleId = resolved.currentCycleId ?? resolved.recommendedCycleId;
  const stations = cycleId ? graph.byCycle[cycleId]?.stationIds ?? [] : [];
  const currentIndex = stations.indexOf(resolved.currentStationId);
  const nextRelevantStationId = stations.slice(currentIndex + 1).find((id) => resolved.pathStationIds.includes(id));
  return { pageMode: "on-path", involvement, nextRelevantStationId, primaryStationId: nextRelevantStationId };
}
