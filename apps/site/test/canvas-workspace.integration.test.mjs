import assert from "node:assert/strict";
import test from "node:test";
import canvasManifest from "../../../generated/method/canvas-manifest.en.json" with { type: "json" };
import { canvasStorageKeys, createCanvasExport, parseCanvasExport } from "../src/lib/canvas-workspace.mjs";
import { visibleCanvasSections } from "../src/lib/canvas-focus.mjs";

const canvas = canvasManifest.translations.en.customerJourneyCanvas;

test("production canvas definition persists under stable entity and metadata keys", () => {
  assert.deepEqual(canvasStorageKeys("business-owner", canvas.id), {
    notes: `apiops-canvas:business-owner:${canvas.id}`,
    metadata: `apiops-canvas:business-owner:${canvas.id}:metadata`,
  });
});

test("production canvas definition round-trips notes and metadata through JSON", () => {
  const metadata = { title: canvas.title, owner: "API team", context: "Launch", date: "2026-07-19" };
  const notes = { [canvas.sections[0].id]: [{ content: "Observed  need\nwith spacing", color: "#fff399", size: 80 }] };
  const serialized = JSON.stringify(createCanvasExport(canvas, "en", metadata, notes));
  const expectedNotes = Object.fromEntries(canvas.sections.map((section) => [section.id, notes[section.id] ?? []]));
  assert.deepEqual(parseCanvasExport(serialized, canvas), { notes: expectedNotes, metadata });
  assert.throws(() => parseCanvasExport(serialized.replace(canvas.importExportTemplate.templateId, "other-template"), canvas), /Invalid canvas JSON/);
});

test("canvas JSON import preserves note whitespace and accepts notes without size", () => {
  const content = "Keep  internal   spaces";
  const serialized = JSON.stringify({
    ...canvas.importExportTemplate,
    canvasMetadata: { title: canvas.title, owner: "", context: "", date: "" },
    sections: [{ sectionId: canvas.sections[0].id, stickyNotes: [{ content, color: "#fff399" }] }],
  });

  const parsed = parseCanvasExport(serialized, canvas);

  assert.equal(parsed.notes[canvas.sections[0].id][0].content, content);
  assert.equal(parsed.notes[canvas.sections[0].id][0].size, 80);
});

test("focus selection preserves section identity, order, and specialized grid semantics", () => {
  const standard = { id: "standard", gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 } };
  const highlighted = { id: "highlighted", highlight: true, gridPosition: { column: 1, row: 0, colSpan: 2, rowSpan: 1 } };
  const journey = { id: "journey", journeySteps: ["Discover", "Decide"], gridPosition: { column: 0, row: 1, colSpan: 3, rowSpan: 2 } };
  const sections = [standard, highlighted, journey];

  assert.equal(visibleCanvasSections([standard], standard.id, true)[0], standard);
  assert.deepEqual(visibleCanvasSections(sections, highlighted.id, false), sections);
  assert.equal(visibleCanvasSections(sections, highlighted.id, true)[0], highlighted);
  assert.equal(visibleCanvasSections(sections, journey.id, true)[0], journey);
});

test("imported notes do not affect which active section focus mode renders", () => {
  const sections = canvas.sections;
  const active = sections.at(-1);
  const importedNotes = { [active.id]: [{ content: "Imported evidence", color: "#fff399", size: 80 }] };

  assert.deepEqual(visibleCanvasSections(sections, active.id, true).map(({ id }) => id), [active.id]);
  assert.equal(importedNotes[active.id][0].content, "Imported evidence");
});
