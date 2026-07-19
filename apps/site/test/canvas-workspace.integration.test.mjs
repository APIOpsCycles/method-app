import assert from "node:assert/strict";
import test from "node:test";
import canvasManifest from "../../../generated/method/canvas-manifest.en.json" with { type: "json" };
import { canvasStorageKeys, createCanvasExport, parseCanvasExport } from "../src/lib/canvas-workspace.mjs";

const canvas = canvasManifest.translations.en.customerJourneyCanvas;

test("production canvas definition persists under stable entity and metadata keys", () => {
  assert.deepEqual(canvasStorageKeys("business-owner", canvas.id), {
    notes: `apiops-canvas:business-owner:${canvas.id}`,
    metadata: `apiops-canvas:business-owner:${canvas.id}:metadata`,
  });
});

test("production canvas definition round-trips notes and metadata through JSON", () => {
  const metadata = { title: canvas.title, owner: "API team", context: "Launch", date: "2026-07-19" };
  const notes = { [canvas.sections[0].id]: [{ content: "Observed need", color: "#fff399", size: 80 }] };
  const serialized = JSON.stringify(createCanvasExport(canvas, "en", metadata, notes));
  const expectedNotes = Object.fromEntries(canvas.sections.map((section) => [section.id, notes[section.id] ?? []]));
  assert.deepEqual(parseCanvasExport(serialized, canvas), { notes: expectedNotes, metadata });
  assert.throws(() => parseCanvasExport(serialized.replace(canvas.importExportTemplate.templateId, "other-template"), canvas), /Invalid canvas JSON/);
});
