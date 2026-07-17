"use client";

import { useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";
import canvasManifest from "../data/canvas-manifest.en.json";

type CanvasMode = "interactive" | "print" | "presentation";

type CanvasSection = {
  id: string;
  title: string;
  description: string;
  gridPosition: { column: number; row: number; colSpan: number; rowSpan: number };
  fillOrder: number;
  highlight: boolean;
  journeySteps: boolean;
  defaultNoteColor: string;
  defaultNoteIntent: string;
};

type CanvasDefinition = {
  id: string;
  title: string;
  purpose: string;
  howToUse: string;
  layout: { columns: number; rows: number };
  metadata?: {
    source?: string;
    license?: string;
    authors?: string[];
    website?: string;
  };
  footer?: string;
  canvasCreatorUrl: string;
  sections: CanvasSection[];
};

type CanvasNote = {
  id: string;
  text: string;
};

type EditableCanvasMetadata = {
  title: string;
  owner: string;
  context: string;
  date: string;
};

const canvas = canvasManifest.translations.en.customerJourneyCanvas as CanvasDefinition;

const modes: Array<{ id: CanvasMode; label: string; purpose: string }> = [
  { id: "interactive", label: "Interactive workspace", purpose: "Edit, focus, and work with notes" },
  { id: "print", label: "Print and PDF", purpose: "Write and review without interface controls" },
  { id: "presentation", label: "Presentation", purpose: "Reveal one section at a time" },
];

const initialNotes: Record<string, CanvasNote[]> = Object.fromEntries(
  canvas.sections.map((section) => {
    const samples: Record<string, string[]> = {
      persona: ["Operations lead", "API consumer"],
      customerDiscoversNeed: ["Repeated manual work appears in support tickets"],
      customerNeedIsResolved: ["First useful result in under 15 minutes"],
      journeySteps: ["Find guidance", "Request access", "Validate result"],
      pains: ["Manual access approval"],
      gains: ["Clear ownership and faster onboarding"],
      inputsOutputs: ["Customer profile and consent"],
      interactionProcessingRules: ["Only approved scopes may be requested"],
    };
    return [
      section.id,
      (samples[section.id] ?? []).map((text, index) => ({
        id: `${section.id}-${index + 1}`,
        text,
      })),
    ];
  }),
);

function sectionNumber(section: CanvasSection) {
  return String(section.fillOrder).padStart(2, "0");
}

function sectionGridStyle(section: CanvasSection): CSSProperties {
  return {
    gridColumn: `${Math.floor(section.gridPosition.column) + 1} / span ${Math.ceil(section.gridPosition.colSpan)}`,
    gridRow: `${section.gridPosition.row + 1} / span ${section.gridPosition.rowSpan}`,
  };
}

function Note({
  note,
  editable,
  color,
  intent,
  onChange,
  onDelete,
}: {
  note: CanvasNote;
  editable: boolean;
  color: string;
  intent: string;
  onChange: (text: string) => void;
  onDelete: () => void;
}) {
  return (
    <article className="ds-canvas-note" data-note-intent={intent} style={{ background: color }}>
      {editable ? (
        <>
          <textarea aria-label="Canvas note" value={note.text} onChange={(event) => onChange(event.target.value)} />
          <button type="button" className="ds-canvas-note__delete" onClick={onDelete} aria-label={`Delete sticky note: ${note.text}`}>
            ×
          </button>
        </>
      ) : (
        <p>{note.text || "Write a note"}</p>
      )}
    </article>
  );
}

function CanvasZone({
  section,
  active,
  mode,
  notes,
  onActivate,
  onNoteChange,
  onNoteDelete,
  onAddNote,
}: {
  section: CanvasSection;
  active: boolean;
  mode: CanvasMode;
  notes: CanvasNote[];
  onActivate: () => void;
  onNoteChange: (noteId: string, text: string) => void;
  onNoteDelete: (noteId: string) => void;
  onAddNote: () => void;
}) {
  const focusable = mode === "interactive";

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (focusable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onActivate();
    }
  };

  return (
    <section
      className={[
        "ds-canvas-zone",
        section.highlight ? "ds-canvas-zone--anchor" : "ds-canvas-zone--standard",
        section.journeySteps ? "ds-canvas-zone--journey" : "",
        active ? "is-active" : "",
      ].filter(Boolean).join(" ")}
      data-section={section.id}
      data-note-intent={section.defaultNoteIntent}
      tabIndex={focusable ? 0 : undefined}
      onClick={focusable ? onActivate : undefined}
      onKeyDown={handleKeyDown}
      aria-current={active ? "step" : undefined}
      style={sectionGridStyle(section)}
    >
      <header className="ds-canvas-zone__header">
        <span className="ds-canvas-station" aria-hidden="true"><span>{sectionNumber(section)}</span></span>
        <div>
          <h3 className="ds-canvas-zone__eyebrow">{section.title}</h3>
        </div>
      </header>
      <p className="ds-canvas-zone__prompt">{section.description}</p>

      {mode === "print" ? (
        <div className="ds-canvas-write-space" aria-label={`Writable space for ${section.title}`}>
          {notes.map((note) => <p key={note.id}>{note.text}</p>)}
        </div>
      ) : (
        <div className="ds-canvas-note-area" aria-label={`Notes for ${section.title}`}>
          {notes.map((note) => (
            <Note
              key={note.id}
              note={note}
              editable={mode === "interactive"}
              color={section.defaultNoteColor}
              intent={section.defaultNoteIntent}
              onChange={(text) => onNoteChange(note.id, text)}
              onDelete={() => {
                if (window.confirm("Delete this sticky note?")) onNoteDelete(note.id);
              }}
            />
          ))}
          {mode === "interactive" ? (
            <button className="ds-canvas-add-note" type="button" onClick={(event) => { event.stopPropagation(); onAddNote(); }}>
              + Add note
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function PresentationCanvas({
  activeIndex,
  notes,
  onSelect,
}: {
  activeIndex: number;
  notes: Record<string, CanvasNote[]>;
  onSelect: (index: number) => void;
}) {
  const section = canvas.sections[activeIndex];

  return (
    <div className="ds-canvas-presentation" aria-live="polite">
      <nav className="ds-canvas-progress" aria-label="Canvas section progress">
        {canvas.sections.map((item, index) => (
          <button
            key={item.id}
            className={index === activeIndex ? "is-active" : index < activeIndex ? "is-complete" : ""}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={index === activeIndex ? "step" : undefined}
            aria-label={`${sectionNumber(item)} ${item.title}`}
          >
            <span>{sectionNumber(item)}</span>
          </button>
        ))}
      </nav>
      <div className="ds-canvas-presentation__stage">
        <div>
          <p className="section-kicker">Section {sectionNumber(section)} of {canvas.sections.length}</p>
          <h3>{section.title}</h3>
          <p className="ds-canvas-presentation__prompt">{section.description}</p>
          <div className="ds-canvas-presentation__notes">
            {(notes[section.id] ?? []).map((note) => (
              <span
                key={note.id}
                data-note-intent={section.defaultNoteIntent}
                style={{ background: section.defaultNoteColor }}
              >
                {note.text}
              </span>
            ))}
          </div>
        </div>
        <svg
          className="ds-canvas-presentation__story"
          viewBox="20 30 225 410"
          aria-label="Two people having a better conversation"
          role="img"
          style={{ "--apiops-accent": "var(--canvas-accent)" } as CSSProperties}
        >
          <use href="/design-system/humans/apiops-stick-figures-stories.svg#g59" />
        </svg>
      </div>
      <div className="ds-canvas-presentation__actions">
        <button type="button" onClick={() => onSelect(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0}>Previous</button>
        <span>{activeIndex + 1} / {canvas.sections.length}</span>
        <button type="button" onClick={() => onSelect(Math.min(canvas.sections.length - 1, activeIndex + 1))} disabled={activeIndex === canvas.sections.length - 1}>Continue</button>
      </div>
    </div>
  );
}

export default function CanvasSystemDemo() {
  const [mode, setMode] = useState<CanvasMode>("interactive");
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusOnly, setFocusOnly] = useState(false);
  const [notes, setNotes] = useState(initialNotes);
  const [metadata, setMetadata] = useState<EditableCanvasMetadata>({
    title: canvas.title,
    owner: "API product team",
    context: "Design-system example",
    date: new Date().toISOString().slice(0, 10),
  });

  const updateNote = (sectionId: string, noteId: string, text: string) => {
    setNotes((current) => ({
      ...current,
      [sectionId]: (current[sectionId] ?? []).map((note) => (note.id === noteId ? { ...note, text } : note)),
    }));
  };

  const deleteNote = (sectionId: string, noteId: string) => {
    setNotes((current) => ({
      ...current,
      [sectionId]: (current[sectionId] ?? []).filter((note) => note.id !== noteId),
    }));
  };

  const addNote = (sectionId: string) => {
    setNotes((current) => ({
      ...current,
      [sectionId]: [
        ...(current[sectionId] ?? []),
        { id: `${sectionId}-${Date.now()}`, text: "New note" },
      ],
    }));
  };

  return (
    <div className="ds-canvas-system" style={{ "--canvas-accent": "var(--apiops-accent-community)" } as CSSProperties}>
      <div className="ds-canvas-mode-switcher" role="tablist" aria-label="Canvas rendering mode">
        {modes.map((item) => (
          <button
            key={item.id}
            id={`canvas-mode-${item.id}`}
            role="tab"
            aria-selected={mode === item.id}
            aria-controls="canvas-mode-panel"
            type="button"
            onClick={() => { setMode(item.id); setFocusOnly(false); }}
          >
            <strong>{item.label}</strong>
            <span>{item.purpose}</span>
          </button>
        ))}
      </div>

      <div
        id="canvas-mode-panel"
        className={`ds-canvas-shell ds-canvas-shell--${mode}${focusOnly ? " is-focus-only" : ""}`}
        role="tabpanel"
        aria-labelledby={`canvas-mode-${mode}`}
      >
        <header className="ds-canvas-shell__header">
          <div>
            <p className="section-kicker">{canvas.title}</p>
            <h3>{canvas.purpose}</h3>
            <p>{canvas.howToUse}</p>
          </div>
          {mode === "interactive" ? (
            <div className="ds-toolbar" role="toolbar" aria-label="Canvas view controls">
              <button className="ds-button" type="button" aria-pressed={focusOnly} onClick={() => setFocusOnly((value) => !value)}>
                {focusOnly ? "Show all" : "Focus section"}
              </button>
              <button className="ds-button" type="button">Export Markdown</button>
              <button className="ds-button" type="button">Export JSON</button>
              <button className="ds-button" type="button">Import JSON</button>
              <a className="ds-button" href={canvas.canvasCreatorUrl} target="_blank" rel="noreferrer">
                SVG / PNG / PDF in CanvasCreator
              </a>
            </div>
          ) : null}
          {mode === "print" ? <span className="ds-canvas-mode-label">Print and PDF safe</span> : null}
        </header>

        {mode === "presentation" ? (
          <PresentationCanvas activeIndex={activeIndex} notes={notes} onSelect={setActiveIndex} />
        ) : (
          <div className="ds-canvas-grid-wrap">
            <div
              className="ds-canvas-grid"
              style={{
                gridTemplateColumns: `repeat(${canvas.layout.columns}, minmax(140px, 1fr))`,
                gridTemplateRows: `repeat(${canvas.layout.rows}, minmax(150px, auto))`,
              }}
            >
              {canvas.sections.map((section, index) => {
                if (focusOnly && index !== activeIndex) return null;
                return (
                  <CanvasZone
                    key={section.id}
                    section={section}
                    active={mode !== "print" && index === activeIndex}
                    mode={mode}
                    notes={notes[section.id] ?? []}
                    onActivate={() => setActiveIndex(index)}
                    onNoteChange={(noteId, text) => updateNote(section.id, noteId, text)}
                    onNoteDelete={(noteId) => deleteNote(section.id, noteId)}
                    onAddNote={() => addNote(section.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <footer className="ds-canvas-metadata" aria-label="Canvas metadata">
          {mode === "interactive" ? (
            <fieldset className="ds-canvas-metadata__editable">
              <label>
                <span>Canvas name</span>
                <input value={metadata.title} onChange={(event) => setMetadata((current) => ({ ...current, title: event.target.value }))} />
              </label>
              <label>
                <span>Owner or team</span>
                <input value={metadata.owner} onChange={(event) => setMetadata((current) => ({ ...current, owner: event.target.value }))} />
              </label>
              <label>
                <span>Context</span>
                <input value={metadata.context} onChange={(event) => setMetadata((current) => ({ ...current, context: event.target.value }))} />
              </label>
              <label>
                <span>Date</span>
                <input type="date" value={metadata.date} onChange={(event) => setMetadata((current) => ({ ...current, date: event.target.value }))} />
              </label>
            </fieldset>
          ) : (
            <dl className="ds-canvas-metadata__readonly">
              <div><dt>Canvas</dt><dd>{metadata.title}</dd></div>
              <div><dt>Owner or team</dt><dd>{metadata.owner}</dd></div>
              <div><dt>Context</dt><dd>{metadata.context}</dd></div>
              <div><dt>Date</dt><dd>{metadata.date}</dd></div>
            </dl>
          )}
          <div className="ds-canvas-metadata__template" aria-label="Template information">
            {canvas.metadata?.source ? <span>{canvas.metadata.source}</span> : null}
            {canvas.metadata?.license ? <span>{canvas.metadata.license}</span> : null}
            {canvas.metadata?.authors?.length ? <span>{canvas.metadata.authors.join(", ")}</span> : null}
            {canvas.metadata?.website ? <span><a href={`https://${canvas.metadata.website}`} target="_blank" rel="noopener noreferrer">{canvas.metadata.website}</a></span> : null}
            {canvas.footer ? <p>{canvas.footer}</p> : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
