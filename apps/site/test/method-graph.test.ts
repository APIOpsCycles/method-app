import assert from "node:assert/strict";
import { test } from "node:test";
import { getRecommendedNextStations, getStationEmphasis, methodGraph } from "../src/lib/method-graph";
import { initializeMethodContext, METHOD_CONTEXT_KEY, resetMethodContext, setMethodContext } from "../src/lib/method-context";
import { parseStoredMethodContext } from "../src/lib/method-context";
import { INVOLVEMENT_WEIGHT, resolveMethodContext, scoreCycleForContext } from "../src/lib/resolve-method-context";

test("generated graph contains valid, deduplicated adjacency", () => {
  const stationIds = new Set(Object.keys(methodGraph.byStation));
  for (const station of Object.values(methodGraph.byStation)) {
    assert.equal(station.nextStationIds.length, new Set(station.nextStationIds).size);
    station.nextStationIds.forEach((id) => assert.ok(stationIds.has(id)));
  }
});
test("stakeholder and goal relevance combine deterministically", () => {
  assert.equal(getStationEmphasis("api-design", { stakeholderId: "api-designer" }), "medium");
  assert.equal(getStationEmphasis("api-design", { goalId: "create-or-improve-api" }), "medium");
  assert.equal(getStationEmphasis("api-design", { stakeholderId: "api-designer", goalId: "create-or-improve-api" }), "strong");
  assert.equal(getStationEmphasis("ecosystem-vision", {}), "normal");
  assert.deepEqual(getRecommendedNextStations("api-design", {}), getRecommendedNextStations("api-design", {}));
});
test("context persistence migrates a legacy stakeholder and resets", () => {
  const values = new Map([["selectedStakeholder", "api-designer"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => { values.delete(key); } };
  assert.equal(initializeMethodContext(storage).stakeholderId, "api-designer");
  setMethodContext({ goalId: "create-or-improve-api" }, storage);
  assert.match(values.get(METHOD_CONTEXT_KEY) ?? "", /create-or-improve-api/);
  resetMethodContext(storage);
  assert.equal(values.has(METHOD_CONTEXT_KEY), false);
});
test("involvement ranking and cycle scoring are explicit", () => {
  assert.ok(INVOLVEMENT_WEIGHT.lead > INVOLVEMENT_WEIGHT.core);
  assert.ok(INVOLVEMENT_WEIGHT.core > INVOLVEMENT_WEIGHT.consulted);
  assert.ok(scoreCycleForContext("automation-cycle", { stakeholderId: "automation-engineer", goalId: "automate-process" }) > scoreCycleForContext("api-productization-cycle", { stakeholderId: "automation-engineer", goalId: "automate-process" }));
});
test("combined context resolves to meaningful role and goal work", () => {
  const resolved = resolveMethodContext({ stakeholderId: "automation-engineer", goalId: "automate-process", preferredCycleId: "automation-cycle", currentStationId: "api-product-strategy" });
  assert.equal(resolved.recommendedCycleId, "automation-cycle");
  assert.equal(resolved.recommendedEntryStationId, "api-design");
  assert.equal(resolved.stationInvolvement[resolved.recommendedEntryStationId!], "lead");
  assert.equal(resolved.currentStationId, "api-product-strategy");
  assert.equal(resolved.isCurrentStationRelevant, true);
  assert.match(resolved.explanation.stationReasons.join(" "), /lead/);
});
test("stakeholder-only and goal-only recommendations use canonical order", () => {
  assert.equal(resolveMethodContext({ stakeholderId: "capability-owner" }).recommendedEntryStationId, "api-product-strategy");
  const goal = resolveMethodContext({ goalId: "automate-process" });
  assert.equal(goal.recommendedCycleId, "automation-cycle");
  assert.equal(goal.recommendedEntryStationId, "api-product-strategy");
  assert.equal(resolveMethodContext({}).recommendedEntryStationId, undefined);
});
test("consulted-only and invalid contexts are handled safely", () => {
  const consulted = resolveMethodContext({ stakeholderId: "api-program-owner" });
  assert.equal(consulted.stationInvolvement[consulted.recommendedEntryStationId!], "consulted");
  assert.equal(resolveMethodContext({ stakeholderId: "missing", goalId: "missing" }).recommendedCycleId, undefined);
  assert.deepEqual(parseStoredMethodContext(JSON.stringify({ stakeholderId: "missing", goalId: "automate-process", recommendedCycleId: "automation-cycle", currentStationId: "api-design" })), { goalId: "automate-process" });
});
