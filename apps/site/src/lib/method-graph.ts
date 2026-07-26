import graph from "../../../../generated/method/method-graph.json";
import goals from "../../../../generated/method/method-goals.json";
import type { Locale } from "./method-data";

export type Involvement = "lead" | "core" | "consulted";
export type UserMethodContext = { stakeholderId?: string; goalId?: string };
export type MethodEntityType = "cycle" | "line" | "station" | "stakeholder" | "resource" | "canvas";
export type PageMethodContext = { entityType: MethodEntityType; entityId: string; explicitCycleId?: string; cycleIds: string[]; stationIds: string[]; lineIds: string[]; currentStationId?: string };
export type StationEmphasis = "strong" | "medium" | "normal";
export type MethodGraph = {
  version: number;
  byStation: Record<string, { cycleIds: string[]; lineIds: string[]; stakeholders: Array<{ id: string; involvement: Involvement }>; resourceIds: string[]; nextStationIds: string[]; relatedStationIds: string[] }>;
  byStakeholder: Record<string, { stationIds: string[] }>;
  byResource: Record<string, { stationIds: string[] }>;
  byCycle: Record<string, { stationIds: string[]; lineIds: string[] }>;
  byLine: Record<string, { stationIds: string[]; cycleIds: string[] }>;
  byGoal: Record<string, { recommendedCycleIds: string[]; recommendedLineIds: string[]; stationIds: string[] }>;
};
export const methodGraph = graph as MethodGraph;
export const getGoals = (locale: Locale) => goals.translations[locale];
const unique = (ids: string[]) => [...new Set(ids)];
/** Resolve route identity into graph-only context. Display labels belong to the localized catalog. */
export function getPageMethodContext(entityType: MethodEntityType, entityId: string, explicitCycleId?: string): PageMethodContext | undefined {
  let stationIds: string[]; let cycleIds: string[]; let lineIds: string[];
  if (entityType === "cycle") {
    const entity = methodGraph.byCycle[entityId]; if (!entity) return undefined;
    ({ stationIds, lineIds } = entity); cycleIds = [entityId];
  } else if (entityType === "line") {
    const entity = methodGraph.byLine[entityId]; if (!entity) return undefined;
    ({ stationIds, cycleIds } = entity); lineIds = [entityId];
  } else if (entityType === "station") {
    const entity = methodGraph.byStation[entityId]; if (!entity) return undefined;
    stationIds = [entityId]; ({ cycleIds, lineIds } = entity);
  } else {
    const entity = entityType === "stakeholder" ? methodGraph.byStakeholder[entityId] : entityType === "resource" || entityType === "canvas" ? methodGraph.byResource[entityId] : undefined;
    if (!entity) return undefined;
    stationIds = entity.stationIds;
    cycleIds = stationIds.flatMap((id) => methodGraph.byStation[id]?.cycleIds ?? []);
    lineIds = stationIds.flatMap((id) => methodGraph.byStation[id]?.lineIds ?? []);
  }
  stationIds = unique(stationIds).filter((id) => Boolean(methodGraph.byStation[id]));
  cycleIds = unique(cycleIds).filter((id) => Boolean(methodGraph.byCycle[id]));
  lineIds = unique(lineIds).filter((id) => Boolean(methodGraph.byLine[id]));
  const routeCycleId = explicitCycleId && cycleIds.includes(explicitCycleId) ? explicitCycleId : undefined;
  if (routeCycleId) cycleIds = [routeCycleId, ...cycleIds.filter((id) => id !== routeCycleId)];
  return { entityType, entityId, explicitCycleId: routeCycleId, cycleIds, stationIds, lineIds, currentStationId: entityType === "station" ? entityId : undefined };
}
export function getStationEmphasis(stationId: string, context: UserMethodContext): StationEmphasis {
  const station = methodGraph.byStation[stationId];
  const goalPath = context.goalId ? methodGraph.byGoal[context.goalId]?.stationIds : undefined;
  const goal = goalPath?.includes(stationId) ?? false;
  const stakeholder = context.stakeholderId ? station?.stakeholders.some((item) => item.id === context.stakeholderId) && (!goalPath || goal) : false;
  return stakeholder && goal ? "strong" : stakeholder || goal ? "medium" : "normal";
}
export function getRecommendedNextStations(stationId: string, context: UserMethodContext) {
  const candidates = [...(methodGraph.byStation[stationId]?.nextStationIds ?? [])];
  const rank: Record<StationEmphasis, number> = { strong: 0, medium: 1, normal: 2 };
  return candidates.sort((a, b) => rank[getStationEmphasis(a, context)] - rank[getStationEmphasis(b, context)] || a.localeCompare(b));
}
