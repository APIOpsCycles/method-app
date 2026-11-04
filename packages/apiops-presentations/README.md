# APIOps Cycles presentations

Reusable presentation content for people who present the method and teams who build their own branded versions. The method website offers ready-made slides, an online viewer and editable PowerPoint/PDF downloads. This package supplies their shared source.

## Build locally

Install Node.js 22 or newer, then run from this folder:

```sh
npm install
npm run check
npm run build -- --edition apiops-overview --name my-overview
```

From the complete method-app repository, install dependencies at its root and use `npm run presentations:build -- --edition apiops-overview --name my-overview`.

Editions:

| ID | Purpose | Slides |
| --- | --- | --- |
| `capability-productization-cycle` | Productize a reusable capability across eight stations | 16 |
| `apiops-overview` | Introduce the method to a mixed audience | 8 |
| `financial-services-case-study` | Product discovery, portfolio and ways of working | 11 |
| `strategy-to-technical-delivery` | Full introduction through architecture, design, AI, linting and audit | 28 |

Presentation times in `catalog.json` are estimates, not recorded talk durations.

## Branding and content

Copy `brands/partner-example.json`, put your logo in `assets/`, and edit the brand override. Use fonts available on the build and presentation machines. Text is neutral grey by default.

```sh
npm run build -- --edition apiops-overview --brand brands/your-company.json --name your-overview
```

Unspecified settings inherit from `theme.json`. Slide headers use the APIOps Cycles method symbol on its own; its editable SVG and PNG are in `assets/`. Branding controls fonts, text, table fills, the slide logo and footer. Colours and method marks embedded inside image assets are retained. PowerPoint text, bullets, numbering and tables are editable; canvas diagrams and human scenes are images.

| Source | Controls |
| --- | --- |
| `slides/*.json` | Titles, paragraphs, lists, table cells, image references, alt text and notes |
| `editions/*.json` | Ordered slide selection for each talk |
| `layouts.json` | Positions and typography on a 1280 × 720 canvas |
| `theme.json`, `brands/*.json` | Shared branding and partner overrides |
| `canvases/*.json` | Editable fictional canvas examples |
| `typst/template.typ` | Typst renderer, adaptable to another organisation’s template |
| `schemas/` | Editor schemas for slide and brand JSON |
| `catalog.json` | Website metadata, release version and method versions |

Reuse slide IDs across editions so corrections update the shared slide. New slides need a unique ID, an entry in `layouts.json`, and a path in the appropriate edition. Expanded text and new fonts require visual review; the slide layout does not automatically reflow.

Edit the canvas JSON with compatible APIOps tooling, regenerate its image and replace the corresponding `assets/` PNG. The presentation build does not automatically render canvas source JSON.

## Images and scenes

Read [Create and reuse APIOps visuals](https://apiopscycles.com/design-system/visuals) for existing SVG downloads, the Character Grammar and JSON scene recipes, an AI image brief, application asset imports and the exact slide image/layout fields. The downloadable source kit includes the guide as `docs/creating-visuals.md` for offline reference.

The asset browser is at https://apiopscycles.com/design-system#assets. Download an individual scene or pose as standalone SVG. Current presentation image elements use PNG: keep the SVG as editable source and export a PNG into `assets/`. Keep generated-image briefs and attribution in the relevant slide notes and asset documentation. Current deck text remains black or grey; semantic scarf and method accents can keep their colours.

## PDF and Typst

Install the Typst CLI, add it to PATH and run:

```sh
npm run build:pdf -- --edition apiops-overview --name my-overview
```

`npm run build` produces editable PPTX, a portable Reveal.js folder and ZIP, a Typst entry point, resolved JSON and Markdown notes under `output/`. `--format typst` generates only the source outputs. To use the Typst web app, upload the entire package and select the generated `output/*.typ` file as the main file.

The JSON content and brand files are authoritative. Editing a generated PPTX or Typst file does not update them. PPTX and Typst/PDF render independently; inspect wrapping in both formats after content or font changes. Typst falls back to Arial when the chosen font is unavailable; install your brand fonts for an exact match. Speaker notes are in PPTX and Markdown, while the PDF contains audience slides only.

## Reveal.js

The online viewer and downloadable Reveal.js presentation use the same HTML renderer. Titles, paragraphs, lists and tables are real HTML. Canvases and illustrations remain images. The export includes the Reveal.js runtime, notes plugin, theme CSS, image assets and MIT notice, so it uses no external CDN.

```sh
npm run build -- --edition apiops-overview --brand brands/your-company.json --name your-overview --format reveal
```

Serve `output/your-overview-reveal/` with a static HTTP server, for example `npx serve output/your-overview-reveal`, then open its URL. Arrow keys and touch move through slides; Esc opens overview, F opens fullscreen and S opens speaker view. Speaker view needs HTTP and popup permission. Fonts use the selected local font with Arial/monospace fallbacks; include appropriately licensed webfonts in a custom template if exact cross-device typography is required.

The ZIP can be integrated into a partner’s Reveal.js workflow or its `index.html` adapted directly. To keep all output formats consistent, make lasting changes in shared slide JSON, layout and brand settings. Reveal-specific changes do not propagate back to PowerPoint or Typst.

## Publish a release

1. Update `catalog.json` with a new semantic version, date and reviewed edition metadata.
2. Install the required fonts and Typst CLI. Run `npm run release` from this folder (or `npm run presentations:release` at repository root).
3. Inspect every edition’s PowerPoint, PDF, Reveal.js and PNG previews. Review the source ZIP and attribution.
4. Commit the new `releases/<version>/` directory with the source changes. Existing releases are immutable.
5. Run the root `npm run build`. `sync:presentations` verifies release checksums and copies the selected release into the static site. Deploy through the method site’s normal release process.

The source package uses public npm libraries (`pptxgenjs`, `jszip`) and the Typst CLI; it needs no Codex runtime. `npm run release -- --from-output` packages previously reviewed outputs, verifies that resolved source matches the current model, and requires complete PDFs, PPTXs and numbered PNG previews. This is useful when preparing the files with a separate review/build environment.

Normal website builds consume the committed release and need no Typst compiler or presentation generation. The source ZIP contains only an explicit allowlist of source directories and files, excluding dependencies, release binaries, private inputs and build caches.

## Attribution and versions

Method and canvas content retains CC-BY-SA 4.0 attribution to APIOps Cycles and Osaango Ltd. Alexander Osterwalder is additionally credited for API Value Proposition and API Business Model canvases. Source code follows the repository’s Apache 2.0 license. Preserve the notices embedded in canvas templates and the slide notes.

The case study is anonymous; engagement credit belongs to APIsFirst with partner Osaango. Benefits remain qualitative. The supplier-payment scenario, filled canvases and technical continuation are fictional illustrations, not disclosed client implementation details. Private Word/PDF inputs and the partner’s reference Typst document are excluded.

The initial source references method-data 4.2.1 and create-apiops 1.1.4, reviewed on 3 November 2026. `assets/visual-prompt.txt` and slide notes describe conceptual generated images. Review technical commands against the versions used for a later release.

References: https://apiopscycles.com/ · https://typst.app/docs/ · https://gitbrent.github.io/PptxGenJS/
