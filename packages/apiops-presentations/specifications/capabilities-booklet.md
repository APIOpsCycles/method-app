# APIOps Cycles capabilities booklet

The evergreen booklet is 12 A5 portrait pages, titled **Turning ideas into reusable
capabilities**. The source edition is `capabilities-booklet`; current outputs use
the stable prefix `apiops-cycles-capabilities-booklet-a5`. Draft numbers and the
original event name do not belong in current filenames. Git supplies history.

## Rebuild and stage

From the repository root after `npm ci` and `npm run prepare:local-data`:

```powershell
# Python 3 with pypdf must be on PATH, or set PYTHON to its executable path.
# Chrome must be installed for the existing Playwright renderer.
npm run build:booklet --workspace @apiops/presentations -- --stage
npm run test:booklet --workspace @apiops/presentations
```

The build authors the edition JSON, exports through the shared presentation
framework, renders the responsive reading HTML and tagged PDF, finalizes exact
physical boxes, and checks fonts and margins. `--stage` copies the five final
files to `public/booklets/` for direct static downloads. Local intermediate
HTML, previews, source snapshots and Reveal exports stay in ignored `output/`.
An optional `--a6` flag reproduces the smaller historical format with an `a6`
filename suffix. It does not overwrite the A5 files.

Edit `scripts/author-capabilities-booklet.mjs` for the maintained content/layout.
It generates the 12 `slides/capabilities-booklet-*.json` records and the dedicated
layout file. Other presentation editions retain their default layouts.

## Content and review decisions

- The cover connects business goals, people and technology across capabilities,
  APIs, integrations and AI-assisted automation. It has one URL and no partner logo.
- Page 2 introduces the open method with the complete official map, enlarged
  compared with earlier drafts. The full map remains an orientation image; page
  10 provides readable station detail and the reading HTML links to the online map.
- Pages 3–5 connect shared meaning, ownership and bounded AI assistance.
- Page 6 captures the real role/goal context controls and explains the four cycles.
- Page 7 presents people, AI and open-code use in plain language. The responsive
  reading edition expands JSON, knowledge graph and command-line details.
- Page 8 uses the canonical Customer Journey Canvas, including a readable native
  Customer Discovers Need field and a complete-canvas thumbnail.
- Page 10 says to start where it hurts. A/B/C mark actual strategy, consumers and
  responsibilities stations as examples, with no mandatory order.
- Page 11 distinguishes the APIOps Community and its meetups/workshops/talks,
  with the community URL and no method-site footer.
- Page 12 uses the same four partners and original logos as the method website:
  Osaango, adorsys, APIsFirst and API Evangelist. Their logos retain their proportions.
  The illustration is larger and the QR, partner rows and footer have more room.

Illustrations imported from the user's original `Pariisi-Messuvihko.pptx` are
preserved as SVG sources, with prepared PNG siblings for PowerPoint compatibility.
The existing repository AI illustration is reused. Partner provenance is recorded
in `capabilities-booklet-partners.json` and follows `generated/method/partners.json`.
The blank canonical canvas JSON is retained in `canvases/`.

`prepare-capabilities-booklet-visuals.mjs` regenerates the cover derivative, station
excerpt and canonical canvas-field detail. The original paths and native field
elements remain intact. The context screenshot, partner and QR helpers have
matching descriptive filenames.

## Map and website

The site export supplies native paths and text, with an inline vector logo and a
4,096-pixel intrinsic long edge. Its substation labels are 27% larger, with full
names wrapped and spaced for all five site languages. The presentation helper
downloads through the same Export SVG button and makes a separate raster fallback:

```powershell
node packages/apiops-presentations/scripts/export-metro-assets.mjs http://127.0.0.1:4321/ capabilities-booklet-capability-map 4096
node packages/apiops-presentations/scripts/prepare-capabilities-booklet-visuals.mjs
```

The localized `/resources` index derives tools and their station/cycle links from
the same method catalog. Deploy this PR through the normal site process before
distributing the booklet. Creating these files does not itself deploy the site.

## Production and checks

Reading PDF and native PowerPoint size: **148 x 210mm**. Print media: **154 x 216mm**,
including 3mm white bleed and an A5 TrimBox. Files have 12 pages in reading order,
with no imposed spreads or crop marks. All fonts are embedded in the PDFs.
PowerPoint contains ordinary high-resolution PNGs; PDF/HTML retain supplied vectors.

All 12 finalized PDF pages were rendered and visually reviewed. The fixed layouts
have no text overflow and the reading HTML fits a 390px viewport. All 33 PowerPoint
images decode and match their prepared files. Native slide dimensions, exact PDF
boxes, mirrored furniture, >=5mm trim safety, >=7mm binding safety and separate
body/footer clearance checks pass. Main text side margins are about 11.9mm. The
roughly 35.2mm QR decodes at 100, 150 and 300 dpi.

This is RGB artwork, not a certified PDF/X file. Printer-specific colour conversion,
imposition and a physical proof remain part of production handoff. A detailed
handoff accompanies the print PDF.

The booklet is listed in the presentations library with a dedicated
`/presentations/capabilities-booklet` page, an A5 cover preview and direct links
to reading HTML, PowerPoint and both PDF variants. Booklet publications are
independent of the immutable reviewed slide-release manifest.
