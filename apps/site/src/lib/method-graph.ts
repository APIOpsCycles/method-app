import graph from "../../../../generated/method/method-graph.json";
import goals from "../../../../generated/method/method-goals.json";
import type { Locale } from "./method-data";

export type Involvement = "lead" | "core" | "consulted";
export type UserMethodContext = { stakeholderId?: string; goalId?: string };
export type MethodEntityType = "cycle" | "line" | "station" | "stakeholder" | "resource" | "canvas";
export type PageMethodContext = { entityType: MethodEntityType; entityId: string; cycleIds: string[]; stationIds?: string[] };
export type StationEmphasis = "strong" | "medium" | "normal";
export type MethodGraph = {
  version: number;
  byStation: Record<string, { cycleIds: string[]; lineIds: string[]; stakeholders: Array<{ id: string; involvement: Involvement }>; resourceIds: string[]; nextStationIds: string[]; relatedStationIds: string[] }>;
  byStakeholder: Record<string, { stationIds: string[] }>;
  byResource: Record<string, { stationIds: string[] }>;
  byCycle: Record<string, { stationIds: string[]; lineIds: string[] }>;
  byGoal: Record<string, { recommendedCycleIds: string[]; recommendedLineIds: string[]; stationIds: string[] }>;
};
export const methodGraph = graph as MethodGraph;
export const getGoals = (locale: Locale) => goals.translations[locale];
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
