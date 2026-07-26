"use client";

import { useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { designSystemAssets } from "../assets/index.js";

export type MethodContextItem = { id: "stakeholder" | "goal" | "cycle" | "here"; label: string; value: string; href?: string; muted?: boolean; detail?: { value: string; color?: string } };
const methodContextIcons = { stakeholder: [designSystemAssets.icons.method, "icon-people"], goal: [designSystemAssets.icons.method, "icon-alignment"], cycle: [designSystemAssets.icons.metro, "glyph-iterate"], here: [designSystemAssets.icons.metro, "glyph-station"] } as const;

function MethodContextIcon({ item }: { item: MethodContextItem }) {
  if (item.id === "here") return <span className="ds-method-context__icon is-here" aria-hidden="true"><i /></span>;
  const [sheet, symbol] = methodContextIcons[item.id];
  return <span className={`ds-method-context__icon is-${item.id}`} aria-hidden="true"><svg viewBox="0 0 120 120"><use href={`${sheet}#${symbol}`} /></svg></span>;
}

/** Persistent context summary. Editing state and method data remain application-owned. */
export function MethodContextBar({ items, expanded, changeLabel, closeLabel, onToggle, toggleRef }: { items: MethodContextItem[]; expanded: boolean; changeLabel: string; closeLabel: string; onToggle: () => void; toggleRef?: React.RefObject<HTMLButtonElement | null> }) {
  return <div className="ds-method-context"><div className="ds-method-context__items">{items.map((item) => { const detail = item.detail ? <span className="ds-method-context__detail">{item.detail.color ? <i style={{ background: item.detail.color }} aria-hidden="true" /> : null}<span>{item.detail.value}</span></span> : null; const content = <><MethodContextIcon item={item} /><span><small>{item.label}</small><strong title={item.value} className={item.muted ? "is-muted" : ""}>{item.value}</strong>{detail}</span></>; return item.href ? <a key={item.id} href={item.href}>{content}</a> : <span key={item.id} className="ds-method-context__item">{content}</span>; })}</div><button ref={toggleRef} className="ds-method-context__toggle" type="button" aria-expanded={expanded} aria-controls="method-context-editor" onClick={onToggle}>{expanded ? closeLabel : changeLabel}<span aria-hidden="true">⌄</span></button></div>;
}

/** Compact progressive editor container; consumers provide their own labeled controls. */
export function MethodContextEditor({ children }: { children: ReactNode }) { return <div id="method-context-editor" className="ds-method-context-editor">{children}</div>; }

export function ContextGuidance({ tone, title, children }: { tone: "success" | "warning" | "neutral"; title: string; children: ReactNode }) {
  const symbol = tone === "success" ? "icon-decision" : tone === "warning" ? "icon-risk" : "icon-insight";
  return <aside className={`ds-context-guidance is-${tone}`}><span className="ds-context-guidance__icon" aria-hidden="true"><svg viewBox="0 0 120 120"><use href={`${designSystemAssets.icons.method}#${symbol}`} /></svg></span><div><strong>{title}</strong><p>{children}</p></div></aside>;
}

export function SvgAssetDownload({ source, filename, symbolId, viewBox }: { source: string; filename: string; symbolId?: string; viewBox?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function download() {
    setStatus("loading");
    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Asset source returned ${response.status}`);
      let contents = await response.text();
      if (symbolId) {
        const document = new DOMParser().parseFromString(contents, "image/svg+xml");
        const symbol = document.getElementById(symbolId);
        if (document.querySelector("parsererror") || !symbol) throw new Error("SVG symbol was not found");
        const resolvedViewBox = viewBox ?? symbol.getAttribute("viewBox") ?? "0 0 96 96";
        const embeddedStyles = Array.from(document.querySelectorAll("style"))
          .map((style) => style.outerHTML)
          .join("");
        contents = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${resolvedViewBox}"><defs>${embeddedStyles}${symbol.outerHTML}</defs><use href="#${symbolId}" /></svg>`;
      }
      const url = URL.createObjectURL(new Blob([contents], { type: "image/svg+xml;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename.replace(/[^a-z0-9-_]+/gi, "-")}.svg`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return <span className="ds-svg-download"><button type="button" disabled={status === "loading"} onClick={() => void download()}>{status === "loading" ? "Preparing SVG…" : "Download SVG"}</button>{status === "error" ? <small role="alert">The SVG could not be downloaded.</small> : null}</span>;
}

export type MetroPoint = { x: number; y: number };

/** Presentation-only SVG frame for a metro diagram. Routing and data stay with the consumer. */
export function MetroMapShell({ label, children, svgRef, width = 1000, height = 1000, className = "metro-map" }: { label: string; children: ReactNode; svgRef?: React.RefObject<SVGSVGElement | null>; width?: number; height?: number; className?: string }) {
  return <svg ref={svgRef} className={className} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>{children}</svg>;
}

/** A generic visual route. The application remains responsible for producing its points. */
export function MetroLinePath({ id, points, color, selected = false, onSelect, closed = false, className = "metro-route", strokeWidth, opacity }: { id: string; points: MetroPoint[]; color: string; selected?: boolean; onSelect?: (id: string) => void; closed?: boolean; className?: string; strokeWidth?: number; opacity?: number }) {
  const d = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ") + (closed ? " Z" : "");
  return <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth ?? (selected ? 6 : 3)} strokeLinecap="round" strokeLinejoin="round" opacity={opacity ?? (selected ? 0.92 : 0.08)} onClick={onSelect ? () => onSelect(id) : undefined} className={className} />;
}

export function MetroSelectionRing({ x, y, radius, color, className = "metro-selection-ring" }: { x: number; y: number; radius: number; color?: string; className?: string }) {
  return <circle cx={x} cy={y} r={radius} className={className} stroke={color} />;
}

/** Keyboard-operable SVG station wrapper; visuals are supplied as children. */
export function MetroStationButton({ id, label, x, y, selected = false, selectionRadius = 13, selectionColor, className = "metro-station", onSelect, children }: { id: string; label: string; x: number; y: number; selected?: boolean; selectionRadius?: number; selectionColor?: string; className?: string; onSelect: (id: string) => void; children: ReactNode }) {
  return <g role="button" tabIndex={0} aria-label={label} className={className} onClick={() => onSelect(id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(id); } }}><title>{label}</title>{selected ? <MetroSelectionRing x={x} y={y} radius={selectionRadius} color={selectionColor} /> : null}{children}</g>;
}

export function MetroStationMarker({ x, y, radius, label, labelX, labelY, textAnchor = "start", number, nodeClassName = "metro-support-node", labelClassName = "metro-support-label" }: { x: number; y: number; radius: number; label?: string; labelX?: number; labelY?: number; textAnchor?: "start" | "middle" | "end"; number?: string | number; nodeClassName?: string; labelClassName?: string }) {
  return <><circle cx={x} cy={y} r={radius} className={nodeClassName} />{number !== undefined ? <text x={x} y={y + 4} textAnchor="middle" className="metro-node-number">{number}</text> : null}{label ? <text x={labelX ?? x + radius + 6} y={labelY ?? y} textAnchor={textAnchor} dominantBaseline="middle" className={labelClassName}>{label}</text> : null}</>;
}

export function MetroLegend({ items, x, y, rowGap = 28 }: { items: Array<{ id: string; label: string; color: string }>; x: number; y: number; rowGap?: number }) {
  return <g className="metro-line-legend">{items.map((item, index) => <g key={item.id} transform={`translate(${x} ${y + index * rowGap})`}><rect x="0" y="-12" width="18" height="18" fill={item.color} /><text x="30" y="2">{item.label}</text></g>)}</g>;
}

export type StakeholderRoleOption = {
  id: string;
  title: string;
};

export function CompactSection({
  title,
  expanded,
  expandLabel,
  collapseLabel,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  expandLabel: string;
  collapseLabel: string;
  onToggle?: () => void;
  children?: ReactNode;
}) {
  return (
    <section className="journey-criteria">
      <div className="compact-section-head">
        <h3>{title}</h3>
        <button type="button" aria-expanded={expanded} aria-label={`${expanded ? collapseLabel : expandLabel}: ${title}`} onClick={onToggle}>
          {expanded ? "▾" : "▸"}
        </button>
      </div>
      {expanded ? children : null}
    </section>
  );
}

export type PillListItem = { id: string; label: string };

export function PillList({ items, label, onSelect }: { items: PillListItem[]; label: string; onSelect?: (id: string) => void }) {
  return (
    <div className="pill-list" aria-label={label}>
      {items.map((item) => onSelect ? (
        <button key={item.id} type="button" onClick={() => onSelect(item.id)}>{item.label}</button>
      ) : <span key={item.id}>{item.label}</span>)}
    </div>
  );
}

export type ResourceSelectorItem = { id: string; type: string; title: string; description: string; icon?: ReactNode };

export function ResourceSelector({ items, value, emptyLabel, onChange }: { items: ResourceSelectorItem[]; value?: string; emptyLabel: string; onChange: (id: string) => void }) {
  if (!items.length) return <span className="side-resource-card side-resource-card--empty">{emptyLabel}</span>;
  return (
    <div className="side-resource-grid">
      {items.map((item) => (
        <button className={`side-resource-card${item.id === value ? " is-active" : ""}`} key={item.id} type="button" onClick={() => onChange(item.id)}>
          <span className="side-resource-card__meta">{item.icon}{item.type}</span>
          <strong>{item.title}</strong>
          <small>{item.description}</small>
        </button>
      ))}
    </div>
  );
}

export type JourneyCriterion = { id: string; title: string };

/** A shared entry/exit criteria presentation for method journeys. */
export function JourneyCriteria({ entryCriteria, exitCriteria, entryLabel, exitLabel, emptyLabel }: { entryCriteria: JourneyCriterion[]; exitCriteria: JourneyCriterion[]; entryLabel: string; exitLabel: string; emptyLabel?: string }) {
  const criteriaList = (items: JourneyCriterion[]) => items.length ? (
    <ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul>
  ) : emptyLabel ? <p className="journey-criteria__empty">{emptyLabel}</p> : null;

  return (
    <div className="criteria-grid">
      <div><h3>{entryLabel}</h3>{criteriaList(entryCriteria)}</div>
      <div><h3>{exitLabel}</h3>{criteriaList(exitCriteria)}</div>
    </div>
  );
}

export function PartnerCard({ href, title, description, logo, logoAlt = "", external = false }: { href: string; title: string; description: string; logo?: string; logoAlt?: string; external?: boolean }) {
  return (
    <a className="ds-partner-card" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {logo ? <img src={logo} alt={logoAlt} /> : null}<div><h3>{title}</h3><p>{description}</p></div>
    </a>
  );
}

export type EntitySectionItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
};

export type StationSectionItem = EntitySectionItem & {
  /** Every route color that passes through this station. */
  lineColors?: string[];
  /** Optional contextual links, such as the cycle-specific version of a core station. */
  relatedLinks?: Array<{ href: string; label: string }>;
  supportingText?: string;
};

export type LineSectionItem = EntitySectionItem & { color: string; icon?: string };

export type RoleParticipationRow = {
  station: { id: string; title: string; href: string };
  involvement: { label: string; value: "lead" | "core" | "consulted" };
  resources: Array<{ id: string; title: string; href: string }>;
};

export type InvolvementLabels = { lead: string; core: string; consulted: string };

const involvementIcons = {
  lead: "icon-decision",
  core: "icon-alignment",
  consulted: "icon-insight",
} as const;

/** Accessible, responsive presentation for one role's participation in a cycle. */
export function RoleParticipationTable({ cycle, rows, labels }: {
  cycle: { id: string; title: string; href: string };
  rows: RoleParticipationRow[];
  labels: { station: string; involvement: string; resources: string; noResources: string };
}) {
  return <section className="ds-role-participation" aria-labelledby={`role-cycle-${cycle.id}`}>
    <h3 id={`role-cycle-${cycle.id}`}><a href={cycle.href}>{cycle.title}</a></h3>
    <div className="ds-role-participation__surface">
      <table>
        <thead><tr><th scope="col">{labels.station}</th><th scope="col">{labels.involvement}</th><th scope="col">{labels.resources}</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.station.id}>
          <th scope="row" data-label={labels.station}><a href={row.station.href}>{row.station.title}</a></th>
          <td data-label={labels.involvement}><span className={`ds-involvement-badge is-${row.involvement.value}`}><span className="ds-involvement-badge__icon" aria-hidden="true"><svg viewBox="0 0 120 120"><use href={`${designSystemAssets.icons.method}#${involvementIcons[row.involvement.value]}`} /></svg></span>{row.involvement.label}</span></td>
          <td data-label={labels.resources}>{row.resources.length ? <ul className="ds-role-resource-list">{row.resources.map((resource) => <li key={resource.id}><a href={resource.href}>{resource.title}</a></li>)}</ul> : <span className="ds-table-empty">{labels.noResources}</span>}</td>
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}

function EntityHeading({ id, title, href }: Pick<EntitySectionItem, "id" | "title" | "href">) {
  return <h3><a href={href} data-entity-id={id}>{title}</a></h3>;
}

/** Canonical presentation for an `id="cycles"` collection. */
export function CyclesSection({ title, items, id = "cycles" }: { title: string; items: EntitySectionItem[]; id?: string }) {
  return <section className="public-section ds-entity-section ds-cycles-section" aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    <div className="public-card-grid">{items.map((item) => <article className="public-card ds-cycle-card" key={item.id}>
      <EntityHeading {...item} />{item.description ? <p>{item.description}</p> : null}
    </article>)}</div>
  </section>;
}

/** Canonical station collection. Line colors make interchange and shared stations visible. */
export function StationsSection({ title, items, ordered = false, id = "stations" }: { title: string; items: StationSectionItem[]; ordered?: boolean; id?: string }) {
  const List = ordered ? "ol" : "ul";
  return <section className="public-section ds-entity-section ds-stations-section" aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    <List className="ds-station-list">{items.map((item) => {
      const colors = item.lineColors?.length ? item.lineColors : ["var(--color-neutral-silver, #94a3b8)"];
      const stripe = `linear-gradient(180deg, ${colors.map((color, index) => `${color} ${index / colors.length * 100}% ${(index + 1) / colors.length * 100}%`).join(", ")})`;
      return <li key={item.id} style={{ "--station-lines": stripe } as CSSProperties}>
        <div className="ds-station-marker" aria-hidden="true" />
        <div><EntityHeading {...item} />{item.description ? <p>{item.description}</p> : null}{item.supportingText ? <p>{item.supportingText}</p> : null}
          {item.relatedLinks?.length ? <ul className="ds-station-related">{item.relatedLinks.map((link) => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul> : null}
        </div>
      </li>;
    })}</List>
  </section>;
}

/** Canonical line collection; consumers choose all lines or a pre-filtered cycle/station set. */
export function LinesSection({ title, items, id = "lines" }: { title: string; items: LineSectionItem[]; id?: string }) {
  return <section className="public-section ds-entity-section ds-lines-section" aria-labelledby={id}>
    <h2 id={id}>{title}</h2>
    <div className="public-card-grid">{items.map((item) => <article className="public-card ds-line-card" style={{ "--line-color": item.color } as CSSProperties} key={item.id}>
      <div className="ds-line-title"><span aria-hidden="true">{item.icon || "●"}</span><EntityHeading {...item} /></div>{item.description ? <p>{item.description}</p> : null}
    </article>)}</div>
  </section>;
}

export function AnnouncementToast({ children, dismissLabel, onDismiss, className = "" }: { children: ReactNode; dismissLabel: string; onDismiss: () => void; className?: string }) {
  return (
    <aside className={`ds-announcement ${className}`.trim()} role="status" aria-live="polite">
      <p>{children}</p><button type="button" aria-label={dismissLabel} onClick={onDismiss}>&times;</button>
    </aside>
  );
}

/** Key for the stakeholder involvement markers used on method maps and controls. */
export function InvolvementLegend({ label, labels }: { label: string; labels: InvolvementLabels }) {
  return <span className="ds-involvement-legend" aria-label={label}>
    <i className="is-lead" aria-hidden="true" />{labels.lead}
    <i className="is-core" aria-hidden="true" />{labels.core}
    <i className="is-consulted" aria-hidden="true" />{labels.consulted}
  </span>;
}

export function StakeholderRoleSelector({
  roles,
  value,
  label,
  placeholder,
  involvementLabels,
  disabled = false,
  onChange,
}: {
  roles: StakeholderRoleOption[];
  value: string;
  label: string;
  placeholder: string;
  involvementLabels: InvolvementLabels;
  disabled?: boolean;
  onChange: (roleId: string) => void;
}) {
  return (
    <label className="ds-stakeholder-role-selector">
      <span className="ds-stakeholder-role-selector__label">{label}</span>
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {roles.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}
      </select>
      <InvolvementLegend label={label} labels={involvementLabels} />
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
  fullscreen = false,
  title,
  kicker,
  description,
  toolbar,
  children,
  metadata,
}: {
  mode?: CanvasSystemMode;
  focusOnly?: boolean;
  fullscreen?: boolean;
  title: string;
  kicker?: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
  metadata?: ReactNode;
}) {
  return (
    <div className={`ds-canvas-shell ds-canvas-shell--${mode}${focusOnly ? " is-focus-only" : ""}${fullscreen ? " is-fullscreen" : ""}`}>
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

/** Executable visual-contract fixture. Application persistence and method data do not belong here. */
export function CanvasSystemFixture() {
  const [metadata, setMetadata] = useState<CanvasSystemMetadata>({ title: "Fixture canvas", owner: "Design team", context: "Component review", date: "2026-07-19" });
  const [active, setActive] = useState("anchor");
  const sections: CanvasSystemSection[] = [
    { id: "anchor", title: "Highlighted section", description: "An anchor section with a populated note area.", gridPosition: { column: 0, row: 0, colSpan: 1, rowSpan: 1 }, fillOrder: 1, highlight: true, journeySteps: false, defaultNoteColor: "#fff399", defaultNoteIntent: "idea" },
    { id: "journey", title: "Journey section", description: "A journey treatment with an intentionally empty note area.", gridPosition: { column: 1, row: 0, colSpan: 1, rowSpan: 1 }, fillOrder: 2, highlight: false, journeySteps: true, defaultNoteColor: "#d9f6ee", defaultNoteIntent: "step" },
  ];
  const labels = { title: "Canvas name", owner: "Owner", context: "Context", date: "Date" };
  const notes: Record<string, CanvasSystemNote[]> = { anchor: [{ id: "fixture-note", text: "Populated note", color: "#fff399" }], journey: [] };

  return <div className="ds-canvas-system" data-testid="canvas-system-fixture">
    {(["interactive", "presentation", "print"] as CanvasSystemMode[]).map((mode) => (
      <CanvasSystemShell
        key={mode}
        mode={mode}
        focusOnly={mode === "interactive"}
        kicker="Canvas system fixture"
        title={`${mode[0].toUpperCase()}${mode.slice(1)} mode`}
        description="Visual states are deliberately colocated for regression review."
        metadata={mode === "interactive" ? <CanvasSystemMetadataEditor metadata={metadata} labels={labels} onChange={setMetadata} /> : <CanvasSystemMetadataReadOnly metadata={metadata} labels={labels} />}
      >
        <CanvasSystemGrid columns={2} rows={1}>
          {sections.map((section) => <CanvasSystemZone
            key={section.id}
            section={section}
            mode={mode}
            active={active === section.id}
            notes={notes[section.id]}
            addLabel="Add note"
            deleteLabel="Delete note"
            onActivate={mode === "interactive" ? () => setActive(section.id) : undefined}
            onNoteChange={() => undefined}
            onNoteDelete={() => undefined}
          />)}
        </CanvasSystemGrid>
      </CanvasSystemShell>
    ))}
  </div>;
}
