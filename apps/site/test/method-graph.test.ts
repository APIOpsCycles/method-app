import assert from "node:assert/strict";
import { test } from "node:test";
import { getRecommendedNextStations, getStationEmphasis, methodGraph } from "../src/lib/method-graph";
import { initializeMethodContext, METHOD_CONTEXT_KEY, resetMethodContext, setMethodContext } from "../src/lib/method-context";

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
