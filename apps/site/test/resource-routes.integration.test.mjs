import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { resourcePath } from "../src/lib/resource-routes.mjs";

const root = path.resolve(import.meta.dirname, "../../..");
const fixtures = JSON.parse(await readFile(new URL("./fixtures/resource-routes.json", import.meta.url), "utf8"));

for (const fixture of fixtures) {
  test(fixture.description, () => {
    assert.equal(resourcePath(fixture.locale, fixture.resource), fixture.expected);
  });
}

test("station step resource links use public slugs and point to generated Astro routes", async () => {
  const artifact = (await import("../../../generated/method/method-catalog.en.json", { with: { type: "json" } })).default;
  const catalog = artifact.translations.en;
  const resource = catalog.resources.find((item) => item.id === "customerJourneyCanvas");
  assert.ok(resource && !resource.draft, "regression resource is public");

  const href = resourcePath("en", resource);
  assert.equal(href, "/resources/customer-journey-canvas");
  const station = catalog.stations.find((item) => item.steps.some((step) => step.resourceId === resource.id));
  assert.ok(station, "a station references the regression resource");
  const stationHtml = await readFile(path.join(root, "dist/stations", station.id, "index.html"), "utf8");
  assert.match(stationHtml, new RegExp(`href="${href}"`));
  await readFile(path.join(root, "dist", href.slice(1), "index.html"), "utf8");
  assert.doesNotMatch(stationHtml, /href="\/resources\/customerJourneyCanvas"/);
});
