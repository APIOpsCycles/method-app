"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export function canvasSectionNumber(section) {
    return String(section.fillOrder).padStart(2, "0");
}
export function canvasSectionGridStyle(section) {
    return {
        gridColumn: `${Math.floor(section.gridPosition.column) + 1} / span ${Math.ceil(section.gridPosition.colSpan)}`,
        gridRow: `${section.gridPosition.row + 1} / span ${section.gridPosition.rowSpan}`,
    };
}
export function CanvasSystemShell({ mode = "interactive", focusOnly = false, title, kicker, description, toolbar, children, metadata, }) {
    return (_jsxs("div", { className: `ds-canvas-shell ds-canvas-shell--${mode}${focusOnly ? " is-focus-only" : ""}`, children: [_jsxs("header", { className: "ds-canvas-shell__header", children: [_jsxs("div", { children: [kicker ? _jsx("p", { className: "section-kicker", children: kicker }) : null, _jsx("h3", { children: title }), description ? _jsx("p", { children: description }) : null] }), toolbar] }), children, metadata] }));
}
export function CanvasSystemGrid({ columns, rows, children, }) {
    return (_jsx("div", { className: "ds-canvas-grid-wrap", children: _jsx("div", { className: "ds-canvas-grid", style: {
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(112px, auto))`,
            }, children: children }) }));
}
export function CanvasSystemNoteView({ note, editable, color, intent, deleteLabel, onChange, onDelete, }) {
    return (_jsx("article", { className: "ds-canvas-note", "data-note-intent": intent, style: { background: note.color || color }, children: editable ? (_jsxs(_Fragment, { children: [_jsx("textarea", { "aria-label": "Canvas note", value: note.text, onChange: (event) => onChange?.(event.target.value) }), onDelete ? (_jsx("button", { type: "button", className: "ds-canvas-note__delete", onClick: onDelete, "aria-label": `${deleteLabel}: ${note.text}`, title: deleteLabel, children: "\u00D7" })) : null] })) : (_jsx("p", { children: note.text || "Write a note" })) }));
}
export function CanvasSystemZone({ section, active = false, mode = "interactive", notes, addLabel, deleteLabel, noteInput, onActivate, onNoteChange, onNoteDelete, onAddNote, }) {
    const focusable = mode === "interactive" && Boolean(onActivate);
    const handleKeyDown = (event) => {
        if (focusable && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onActivate?.();
        }
    };
    return (_jsxs("section", { className: [
            "ds-canvas-zone",
            section.highlight ? "ds-canvas-zone--anchor" : "ds-canvas-zone--standard",
            section.journeySteps ? "ds-canvas-zone--journey" : "",
            active ? "is-active" : "",
        ].filter(Boolean).join(" "), "data-section": section.id, "data-note-intent": section.defaultNoteIntent, tabIndex: focusable ? 0 : undefined, onClick: focusable ? onActivate : undefined, onKeyDown: handleKeyDown, "aria-current": active ? "step" : undefined, style: canvasSectionGridStyle(section), children: [_jsxs("header", { className: "ds-canvas-zone__header", children: [_jsx("span", { className: "ds-canvas-station", "aria-hidden": "true", children: _jsx("span", { children: canvasSectionNumber(section) }) }), _jsx("div", { children: _jsx("h3", { className: "ds-canvas-zone__eyebrow", children: section.title }) })] }), _jsx("p", { className: "ds-canvas-zone__prompt", children: section.description }), mode === "print" ? (_jsx("div", { className: "ds-canvas-write-space", "aria-label": `Writable space for ${section.title}`, children: notes.map((note) => _jsx("p", { children: note.text }, note.id)) })) : (_jsxs("div", { className: "ds-canvas-note-area", "aria-label": `Notes for ${section.title}`, children: [notes.map((note) => (_jsx(CanvasSystemNoteView, { note: note, editable: mode === "interactive", color: section.defaultNoteColor, intent: section.defaultNoteIntent, deleteLabel: deleteLabel, onChange: (text) => onNoteChange?.(note.id, text), onDelete: onNoteDelete ? () => onNoteDelete(note.id) : undefined }, note.id))), mode === "interactive" ? (noteInput ?? (_jsxs("button", { className: "ds-canvas-add-note", type: "button", onClick: (event) => { event.stopPropagation(); onAddNote?.(); }, children: ["+ ", addLabel] }))) : null] }))] }));
}
export function CanvasSystemMetadataEditor({ metadata, labels, onChange, }) {
    return (_jsxs("fieldset", { className: "canvas-meta__editable ds-canvas-metadata__editable", children: [_jsx("legend", { children: labels.title }), _jsxs("label", { children: [_jsx("span", { children: labels.title }), _jsx("input", { value: metadata.title, onChange: (event) => onChange({ ...metadata, title: event.target.value }) })] }), _jsxs("label", { children: [_jsx("span", { children: labels.owner }), _jsx("input", { value: metadata.owner, onChange: (event) => onChange({ ...metadata, owner: event.target.value }) })] }), _jsxs("label", { children: [_jsx("span", { children: labels.context }), _jsx("input", { value: metadata.context, onChange: (event) => onChange({ ...metadata, context: event.target.value }) })] }), _jsxs("label", { children: [_jsx("span", { children: labels.date }), _jsx("input", { type: "date", value: metadata.date, onChange: (event) => onChange({ ...metadata, date: event.target.value }) })] })] }));
}
export function CanvasSystemMetadataReadOnly({ metadata, labels, }) {
    return (_jsxs("dl", { className: "ds-canvas-metadata__readonly", children: [_jsxs("div", { children: [_jsx("dt", { children: labels.title }), _jsx("dd", { children: metadata.title })] }), _jsxs("div", { children: [_jsx("dt", { children: labels.owner }), _jsx("dd", { children: metadata.owner })] }), _jsxs("div", { children: [_jsx("dt", { children: labels.context }), _jsx("dd", { children: metadata.context })] }), _jsxs("div", { children: [_jsx("dt", { children: labels.date }), _jsx("dd", { children: metadata.date })] })] }));
}
