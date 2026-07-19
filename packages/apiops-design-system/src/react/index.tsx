"use client";

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export type StakeholderRoleOption = {
  id: string;
  title: string;
};

export function StakeholderRoleSelector({
  roles,
  value,
  label,
  placeholder,
  involvementLabels,
  onChange,
}: {
  roles: StakeholderRoleOption[];
  value: string;
  label: string;
  placeholder: string;
  involvementLabels: { lead: string; core: string; consulted: string };
  onChange: (roleId: string) => void;
}) {
  return (
    <label className="ds-stakeholder-role-selector">
      <span className="ds-stakeholder-role-selector__label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {roles.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}
      </select>
      <span className="ds-involvement-legend" aria-label={label}>
        <i className="is-lead" aria-hidden="true" />{involvementLabels.lead}
        <i className="is-core" aria-hidden="true" />{involvementLabels.core}
        <i className="is-consulted" aria-hidden="true" />{involvementLabels.consulted}
      </span>
    </label>
  );
}

export type CanvasSystemMode = "interactive" | "print" | "presentation";

export type CanvasSystemSection = {
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

export type CanvasSystemNote = {
  id: string;
  text: string;
  color?: string;
};

export type CanvasSystemMetadata = {
  title: string;
  owner: string;
  context: string;
  date: string;
};

export function canvasSectionNumber(section: CanvasSystemSection) {
  return String(section.fillOrder).padStart(2, "0");
}

export function canvasSectionGridStyle(section: CanvasSystemSection): CSSProperties {
  return {
    gridColumn: `${Math.floor(section.gridPosition.column) + 1} / span ${Math.ceil(section.gridPosition.colSpan)}`,
    gridRow: `${section.gridPosition.row + 1} / span ${section.gridPosition.rowSpan}`,
  };
}

export function CanvasSystemShell({
  mode = "interactive",
  focusOnly = false,
  title,
  kicker,
  description,
  toolbar,
  children,
  metadata,
}: {
  mode?: CanvasSystemMode;
  focusOnly?: boolean;
  title: string;
  kicker?: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  metadata?: ReactNode;
}) {
  return (
    <div className={`ds-canvas-shell ds-canvas-shell--${mode}${focusOnly ? " is-focus-only" : ""}`}>
      <header className="ds-canvas-shell__header">
        <div>
          {kicker ? <p className="section-kicker">{kicker}</p> : null}
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {toolbar}
      </header>
      {children}
      {metadata}
    </div>
  );
}

export function CanvasSystemGrid({
  columns,
  rows,
  children,
}: {
  columns: number;
  rows: number;
  children: ReactNode;
}) {
  return (
    <div className="ds-canvas-grid-wrap">
      <div
        className="ds-canvas-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(112px, auto))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CanvasSystemNoteView({
  note,
  editable,
  color,
  intent,
  deleteLabel,
  onChange,
  onDelete,
}: {
  note: CanvasSystemNote;
  editable: boolean;
  color: string;
  intent: string;
  deleteLabel: string;
  onChange?: (text: string) => void;
  onDelete?: () => void;
}) {
  return (
    <article className="ds-canvas-note" data-note-intent={intent} style={{ background: note.color || color }}>
      {editable ? (
        <>
          <textarea aria-label="Canvas note" value={note.text} onChange={(event) => onChange?.(event.target.value)} />
          {onDelete ? (
            <button type="button" className="ds-canvas-note__delete" onClick={onDelete} aria-label={`${deleteLabel}: ${note.text}`} title={deleteLabel}>
              ×
            </button>
          ) : null}
        </>
      ) : (
        <p>{note.text || "Write a note"}</p>
      )}
    </article>
  );
}

export function CanvasSystemZone({
  section,
  active = false,
  mode = "interactive",
  notes,
  addLabel,
  deleteLabel,
  noteInput,
  onActivate,
  onNoteChange,
  onNoteDelete,
  onAddNote,
}: {
  section: CanvasSystemSection;
  active?: boolean;
  mode?: CanvasSystemMode;
  notes: CanvasSystemNote[];
  addLabel: string;
  deleteLabel: string;
  noteInput?: ReactNode;
  onActivate?: () => void;
  onNoteChange?: (noteId: string, text: string) => void;
  onNoteDelete?: (noteId: string) => void;
  onAddNote?: () => void;
}) {
  const focusable = mode === "interactive" && Boolean(onActivate);
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (focusable && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onActivate?.();
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
      style={canvasSectionGridStyle(section)}
    >
      <header className="ds-canvas-zone__header">
        <span className="ds-canvas-station" aria-hidden="true"><span>{canvasSectionNumber(section)}</span></span>
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
            <CanvasSystemNoteView
              key={note.id}
              note={note}
              editable={mode === "interactive"}
              color={section.defaultNoteColor}
              intent={section.defaultNoteIntent}
              deleteLabel={deleteLabel}
              onChange={(text) => onNoteChange?.(note.id, text)}
              onDelete={onNoteDelete ? () => onNoteDelete(note.id) : undefined}
            />
          ))}
          {mode === "interactive" ? (
            noteInput ?? (
              <button className="ds-canvas-add-note" type="button" onClick={(event) => { event.stopPropagation(); onAddNote?.(); }}>
                + {addLabel}
              </button>
            )
          ) : null}
        </div>
      )}
    </section>
  );
}

export function CanvasSystemMetadataEditor({
  metadata,
  labels,
  onChange,
}: {
  metadata: CanvasSystemMetadata;
  labels: { title: string; owner: string; context: string; date: string };
  onChange: (metadata: CanvasSystemMetadata) => void;
}) {
  return (
    <fieldset className="canvas-meta__editable ds-canvas-metadata__editable">
      <legend>{labels.title}</legend>
      <label>
        <span>{labels.title}</span>
        <input value={metadata.title} onChange={(event) => onChange({ ...metadata, title: event.target.value })} />
      </label>
      <label>
        <span>{labels.owner}</span>
        <input value={metadata.owner} onChange={(event) => onChange({ ...metadata, owner: event.target.value })} />
      </label>
      <label>
        <span>{labels.context}</span>
        <input value={metadata.context} onChange={(event) => onChange({ ...metadata, context: event.target.value })} />
      </label>
      <label>
        <span>{labels.date}</span>
        <input type="date" value={metadata.date} onChange={(event) => onChange({ ...metadata, date: event.target.value })} />
      </label>
    </fieldset>
  );
}

export function CanvasSystemMetadataReadOnly({
  metadata,
  labels,
}: {
  metadata: CanvasSystemMetadata;
  labels: { title: string; owner: string; context: string; date: string };
}) {
  return (
    <dl className="ds-canvas-metadata__readonly">
      <div><dt>{labels.title}</dt><dd>{metadata.title}</dd></div>
      <div><dt>{labels.owner}</dt><dd>{metadata.owner}</dd></div>
      <div><dt>{labels.context}</dt><dd>{metadata.context}</dd></div>
      <div><dt>{labels.date}</dt><dd>{metadata.date}</dd></div>
    </dl>
  );
}
