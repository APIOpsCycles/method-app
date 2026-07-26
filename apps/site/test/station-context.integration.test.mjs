import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../../..");

test("a shared station remains context-free on its generic route", async () => {
  const artifact = (await import("../../../generated/method/method-catalog.en.json", { with: { type: "json" } })).default;
  const catalog = artifact.translations.en;
  const memberships = new Map();
  for (const cycle of catalog.cycles) {
    for (const station of cycle.stations) memberships.set(station.id, [...(memberships.get(station.id) ?? []), cycle]);
  }

  const [stationId, cycles] = [...memberships].find(([id, candidates]) =>
    candidates.length > 1 && new Set(candidates.map((candidate) => candidate.stations.find((item) => item.id === id)?.title)).size > 1
  ) ?? [];
  assert.ok(stationId && cycles, "the catalog contains a shared station with cycle-specific titles");
  const canonicalStation = catalog.stations.find((station) => station.id === stationId);
  assert.ok(canonicalStation);

  const genericHtml = await readFile(path.join(root, "dist/stations", stationId, "index.html"), "utf8");
  assert.match(genericHtml, new RegExp(`<h1>${canonicalStation.title}</h1>`));
  assert.doesNotMatch(genericHtml, /id="criteria"/, "generic HTML does not present journey criteria from a cycle");
  assert.doesNotMatch(genericHtml, /href="\/cycle\//, "generic HTML does not expose cycle-scoped line URLs");

  for (const cycle of cycles) {
    const route = `/cycles/${cycle.slug}/stations/${stationId}`;
    assert.match(genericHtml, new RegExp(`href="${route}"`), `generic HTML offers ${cycle.title} as a route-context choice`);

    const cycleStation = cycle.stations.find((station) => station.id === stationId);
    const stationIndex = cycle.stations.indexOf(cycleStation);
    const entryCriteria = stationIndex === 0 ? cycle.entryCriteriaDetails : cycle.stations[stationIndex - 1].criteriaDetails;
    const exitCriteria = cycleStation.criteriaDetails.length ? cycleStation.criteriaDetails : cycle.exitCriteriaDetails;
    const contextualHtml = await readFile(path.join(root, "dist", route.slice(1), "index.html"), "utf8");

    assert.match(contextualHtml, new RegExp(`<h1>${cycleStation.title}</h1>`));
    for (const criterion of [...entryCriteria, ...exitCriteria]) assert.match(contextualHtml, new RegExp(criterion.title));
    for (const line of catalog.lines.filter((candidate) => candidate.stations.includes(stationId))) {
      assert.match(contextualHtml, new RegExp(`href="/cycle/${cycle.slug}/lines/${line.slug}"`));
    }
  }
});
