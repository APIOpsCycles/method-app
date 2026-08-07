export const CANVAS_STORAGE_PREFIX = "apiops-canvas";

export function canvasStorageKeys(entityId, canvasId) {
  const notes = `${CANVAS_STORAGE_PREFIX}:${entityId}:${canvasId}`;
  return { notes, metadata: `${notes}:metadata` };
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseCanvasExport(text, canvas) {
  const value = JSON.parse(text);
  if (!isRecord(value) || value.templateId !== canvas.importExportTemplate.templateId || !Array.isArray(value.sections)) {
    throw new Error("Invalid canvas JSON or canvas template.");
  }
  const knownSections = new Set(canvas.sections.map((section) => section.id));
  const notes = {};
  for (const section of value.sections) {
    if (!isRecord(section) || typeof section.sectionId !== "string" || !knownSections.has(section.sectionId) || !Array.isArray(section.stickyNotes)) {
      throw new Error("Invalid canvas JSON or section.");
    }
    notes[section.sectionId] = section.stickyNotes.map((note) => {
      if (!isRecord(note) || typeof note.content !== "string" || typeof note.color !== "string" || (note.size !== undefined && typeof note.size !== "number")) {
        throw new Error("Invalid canvas JSON or sticky note.");
      }
      return { content: note.content, color: note.color, size: note.size ?? 80 };
    });
  }
  const metadata = value.canvasMetadata;
  if (metadata !== undefined && (!isRecord(metadata) || !["title", "owner", "context", "date"].every((key) => typeof metadata[key] === "string"))) {
    throw new Error("Invalid canvas JSON or metadata.");
  }
  return { notes, metadata };
}

export function createCanvasExport(canvas, locale, metadata, notes) {
  return {
    ...canvas.importExportTemplate,
    locale,
    canvasMetadata: metadata,
    sections: canvas.sections.map((section) => ({
      sectionId: section.id,
      stickyNotes: (notes[section.id] ?? []).map((note) => ({ ...note, size: note.size ?? 80 })),
    })),
  };
}

