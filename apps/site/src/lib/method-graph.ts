import graph from "../../../../generated/method/method-graph.json";
import goals from "../../../../generated/method/method-goals.json";
import type { Locale } from "./method-data";

export type Involvement = "lead" | "core" | "consulted";
export type UserMethodContext = { stakeholderId?: string; goalId?: string };
export type MethodEntityType = "cycle" | "line" | "station" | "stakeholder" | "resource" | "canvas";
export type PageMethodContext = { entityType: MethodEntityType; entityId: string; cycleIds: string[]; stationIds?: string[] };
export type StationEmphasis = "strong" | "medium" | "normal";
export type MethodGraph = typeof graph;
export const methodGraph = graph;
export const getGoals = (locale: Locale) => goals.translations[locale];
export function getStationEmphasis(stationId: string, context: UserMethodContext): StationEmphasis {
  const station = graph.byStation[stationId as keyof typeof graph.byStation];
  const stakeholder = context.stakeholderId ? station?.stakeholders.some((item) => item.id === context.stakeholderId) : false;
  const goal = context.goalId ? graph.byGoal[context.goalId as keyof typeof graph.byGoal]?.stationIds.includes(stationId) : false;
  return stakeholder && goal ? "strong" : stakeholder || goal ? "medium" : "normal";
}
export function getRecommendedNextStations(stationId: string, context: UserMethodContext) {
  const candidates = [...(graph.byStation[stationId as keyof typeof graph.byStation]?.nextStationIds ?? [])];
  const rank: Record<StationEmphasis, number> = { strong: 0, medium: 1, normal: 2 };
  return candidates.sort((a, b) => rank[getStationEmphasis(a, context)] - rank[getStationEmphasis(b, context)] || a.localeCompare(b));
}
