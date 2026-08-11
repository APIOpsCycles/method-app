# Canvas application and design-system boundary

Canvas definitions are generated method content. The application passes a definition and
application state into `apiops-design-system`; it must not reproduce the design system's
grid, notes, metadata controls, or state styling.

| Concern | Application / framework-neutral utility | `apiops-design-system` |
| --- | --- | --- |
| Sections | Select the method-specific canvas and retain its IDs, prompts, order, attribution, and import/export template. | Place sections on the grid; render numbering, anchor (`highlight`) and journey treatments, active state, and prompts. |
| Notes | Own note values, stable persistence, schema validation, add/update/delete commands, and confirmation before destructive actions. | Present empty/populated note areas, editable and read-only notes, add/delete controls, colors, and note intent. |
| Metadata | Initialize and persist title, owner, context, and date; include them in exports. | Render editable controls in interactive mode and readable metadata in non-editable modes. |
| Modes | Choose `interactive`, `presentation`, or `print` from application/workshop context. | Give every `CanvasSystemMode` its visual and accessible rendering: controls and editing, read-only presentation, or ink-safe writing space. |
| Focus | Own the selected section and decide whether focus-only is enabled. | Provide pointer, Enter, and Space activation, `aria-current`, a visible active state, and focus-only layout. Focus must not reorder the definition. |
| Print | Invoke browser print or file generation and retain method attribution. | Remove editing chrome, shadows, and color-dependent surfaces; keep prompts, existing notes, metadata, borders, and writable space legible. |

## Integration rules

The Astro island (or a framework-neutral application utility) owns local-storage key
construction, defensive loading, versioned JSON round-tripping and validation, browser
downloads, destructive-action confirmation, locale, and method-specific source/license/
author attribution. These are product and data-contract decisions, not visual primitives.

The design system owns `CanvasSystemShell`, `CanvasSystemGrid`, `CanvasSystemZone`,
`CanvasSystemNoteView`, and the metadata controls. Consumers compose those primitives and
must not copy their markup or CSS. The exported `CanvasSystemFixture` is the executable
reference covering all modes and visual/interaction states; it is demonstration content,
not a persistence or method-data example.

