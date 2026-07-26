import assert from "node:assert/strict";
import test from "node:test";

import { validateStationStepResourceReferences } from "../../../scripts/lib/resource-reference-validation.mjs";

const stationStepItems = (station) => station.steps;

test("deduplicates explicitly unpublished station/resource pairs", () => {
  const result = validateStationStepResourceReferences({
    stations: [{ id: "design", steps: [{ resource: "guide" }, { resource: "guide" }] }],
    stationStepItems,
    resources: [{ id: "guide", slug: "resources/guide", draft: "true" }],
  });

  assert.deepEqual(result, [{ pair: "design -> guide", status: "unpublished" }]);
});

test("accepts an explicitly classified external reference", () => {
  const result = validateStationStepResourceReferences({
    stations: [{ id: "design", steps: [{ resource: "vendor-guide", resourceStatus: "external" }] }],
    stationStepItems,
    resources: [],
  });

  assert.deepEqual(result, [{ pair: "design -> vendor-guide", status: "external" }]);
});

test("fails a missing internal resource reference", () => {
  assert.throws(
    () => validateStationStepResourceReferences({
      stations: [{ id: "design", steps: [{ resource: "guied" }] }],
      stationStepItems,
      resources: [],
    }),
    /1 broken internal station\/resource reference.*design -> guied/,
  );
});

test("validates public resource routes", () => {
  assert.throws(
    () => validateStationStepResourceReferences({
      stations: [],
      stationStepItems,
      resources: [{ id: "guide", slug: "guide" }],
    }),
    /Public resource guide has no Astro resource route/,
  );
});
