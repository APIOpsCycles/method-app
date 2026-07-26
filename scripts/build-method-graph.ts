// This generator intentionally accepts the upstream package's evolving JSON
// schema and performs runtime reference validation below.
// @ts-nocheck
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(readFileSync(path.join(root, "generated/method/method-catalog.en.json"), "utf8")).translations.en;
const goals = JSON.parse(readFileSync(path.join(root, "data/method-goals.json"), "utf8")).goals;
const ids = (items) => new Set(items.map((item) => item.id));
const stationIds = ids(catalog.stations), cycleIds = ids(catalog.cycles), lineIds = ids(catalog.lines), stakeholderIds = ids(catalog.stakeholders), resourceIds = ids(catalog.resources);
const errors = [];
const check = (kind, id, owner) => { if (!id || !({ station: stationIds, cycle: cycleIds, line: lineIds, stakeholder: stakeholderIds, resource: resourceIds }[kind]).has(id)) errors.push(`${owner} references missing ${kind} "${id}"`); };
const unique = (values) => [...new Set(values)].sort();
const cycleForStation = (stationId) => catalog.cycles.filter((cycle) => cycle.stations.some((station) => station.id === stationId));
const byStation = {};
for (const station of [...catalog.stations].sort((a, b) => a.id.localeCompare(b.id))) {
  const cycles = cycleForStation(station.id);
  const next = cycles.flatMap((cycle) => { const index = cycle.stations.findIndex((item) => item.id === station.id); return index >= 0 && cycle.stations[index + 1] ? [cycle.stations[index + 1].id] : []; });
  const resources = [...(station.steps ?? []).map((step) => step.resourceId), ...(station.resources ?? []).map((item) => item.id)].filter(Boolean);
  for (const item of station.stakeholders ?? []) check("stakeholder", item.id, `station ${station.id}`);
  for (const id of resources) check("resource", id, `station ${station.id}`);
  byStation[station.id] = { cycleIds: unique(cycles.map((cycle) => cycle.id)), lineIds: unique(catalog.lines.filter((line) => line.stations.includes(station.id)).map((line) => line.id)), stakeholders: [...(station.stakeholders ?? []).map(({ id, involvement }) => ({ id, involvement }))].sort((a, b) => a.id.localeCompare(b.id)), resourceIds: unique(resources), nextStationIds: unique(next), relatedStationIds: [] };
}
// Station order is canonical journey order and must not be alphabetized: it is
// the stable final tie-breaker used by context resolution.
const byCycle = Object.fromEntries(catalog.cycles.map((cycle) => { for (const station of cycle.stations) check("station", station.id, `cycle ${cycle.id}`); return [cycle.id, { stationIds: [...new Set(cycle.stations.map((station) => station.id))], lineIds: unique(catalog.lines.filter((line) => line.stations.some((id) => cycle.stations.some((station) => station.id === id))).map((line) => line.id)) }]; }));
const byStakeholder = Object.fromEntries([...catalog.stakeholders].sort((a,b) => a.id.localeCompare(b.id)).map((stakeholder) => [stakeholder.id, { stationIds: unique(Object.entries(byStation).filter(([, value]) => value.stakeholders.some((item) => item.id === stakeholder.id)).map(([id]) => id)) }]));
const byResource = Object.fromEntries([...catalog.resources].sort((a,b) => a.id.localeCompare(b.id)).map((resource) => [resource.id, { stationIds: unique(Object.entries(byStation).filter(([, value]) => value.resourceIds.includes(resource.id)).map(([id]) => id)) }]));
const byGoal = {};
for (const goal of [...goals].sort((a,b) => a.id.localeCompare(b.id))) {
  for (const id of goal.recommendedCycleIds) check("cycle", id, `goal ${goal.id}`);
  for (const id of goal.recommendedLineIds) check("line", id, `goal ${goal.id}`);
  const selectedLines = new Set(goal.recommendedLineIds);
  // A goal path is the union of its selected lines within each selected cycle.
  // Iterating cycles and their stations retains canonical journey order.
  const derivedStationIds = [...new Set(goal.recommendedCycleIds.flatMap((cycleId) =>
    (byCycle[cycleId]?.stationIds ?? []).filter((stationId) => byStation[stationId].lineIds.some((lineId) => selectedLines.has(lineId)))
  ))];
  byGoal[goal.id] = { recommendedCycleIds: [...new Set(goal.recommendedCycleIds)], recommendedLineIds: [...new Set(goal.recommendedLineIds)], stationIds: derivedStationIds };
}
if (errors.length) throw new Error(`Method graph validation failed:\n- ${errors.join("\n- ")}`);
const graph = { version: 1, byStation, byStakeholder, byResource, byCycle, byGoal };
const localizedGoals = Object.fromEntries(["en", "fi", "fr", "de", "pt"].map((locale) => [locale, goals.map((goal) => ({ id: goal.id, label: goal.label[locale] ?? goal.label.en, description: goal.description[locale] ?? goal.description.en }))]));
for (const directory of ["generated/method", "public/data"]) { mkdirSync(path.join(root, directory), { recursive: true }); writeFileSync(path.join(root, directory, "method-graph.json"), `${JSON.stringify(graph, null, 2)}\n`); writeFileSync(path.join(root, directory, "method-goals.json"), `${JSON.stringify({ version: 1, translations: localizedGoals }, null, 2)}\n`); }
console.log(`Generated method graph: ${Object.keys(byStation).length} stations, ${Object.keys(byStakeholder).length} stakeholders, ${Object.keys(byGoal).length} goals`);
