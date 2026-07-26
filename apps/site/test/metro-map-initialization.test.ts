import assert from "node:assert/strict";
import test from "node:test";
import catalogArtifact from "../../../generated/method/method-catalog.en.json" with { type: "json" };
import { initializeMetroMap, metroStationPath } from "../src/lib/metro-map-initialization";

test("a neutral line page does not combine its first station with an unrelated display cycle", () => {
  const catalog = catalogArtifact.translations.en;
  const firstCycleStationIds = new Set(catalog.cycles[0].stations.map((station) => station.id));
  const sourceLine = catalog.lines.find((candidate) => candidate.stations.some((stationId) => !firstCycleStationIds.has(stationId)));
  assert.ok(sourceLine, "catalog has a line station outside the first cycle");
  const firstStation = sourceLine.stations.find((stationId) => !firstCycleStationIds.has(stationId));
  assert.ok(firstStation);
  const line = { ...sourceLine, stations: [firstStation, ...sourceLine.stations.filter((stationId) => stationId !== firstStation)] };

  const initial = initializeMetroMap(catalog.cycles, undefined, line.stations[0], true);
  assert.equal(initial.cycleId, catalog.cycles[0].id, "the first cycle may provide display geometry");
  assert.equal(initial.stationId, "", "the unrelated line station is not claimed as selected");
  assert.equal(metroStationPath(catalog.cycles, initial.cycleId, catalog.cycles[0].stations[0].id, initial.hasSelectedCycle), `/stations/${catalog.cycles[0].stations[0].id}`, "navigation remains generic before a cycle choice");

  const selectedCycle = catalog.cycles.find((cycle) => cycle.stations.some((station) => line.stations.includes(station.id)));
  assert.ok(selectedCycle);
  const selectedStation = selectedCycle.stations.find((station) => line.stations.includes(station.id));
  assert.ok(selectedStation);
  assert.equal(metroStationPath(catalog.cycles, selectedCycle.id, selectedStation.id, true), `/cycles/${selectedCycle.slug}/stations/${selectedStation.id}`, "a deliberate cycle selection qualifies member station navigation");
  assert.equal(metroStationPath(catalog.cycles, selectedCycle.id, line.stations.find((id) => !selectedCycle.stations.some((station) => station.id === id)) ?? "unrelated", true), `/stations/${line.stations.find((id) => !selectedCycle.stations.some((station) => station.id === id)) ?? "unrelated"}`, "non-member stations keep generic navigation");
});
