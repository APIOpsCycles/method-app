# Paper 2: editable narrative revision

`from-api-readiness-to-sustainable-quality.html` is the editable source of the 17 November 2026 revision, with `paper2.css` and `supplier-payments-metro.svg`. It retains the publication's A4 editorial style and attribution. The logo is the existing `../assets/apiops-cycles-logo.png`.

The eleven-page paper has eight numbered sections. Sections 4 and 6 each span two pages; the final page contains references. Its first two pages establish the organisational problem and contextual readiness before introducing assessment approaches. The fictional Supplier Payments API continues throughout. The supporting PDF and ZIP retain the detailed assessment mappings and comparison versions; their reference numbering is independent.

## Build and review

Requires Node.js 22+, the repository dependencies (`npm ci`), Playwright Chromium (`npx playwright install chromium`) and Poppler (`pdfinfo`, `pdftoppm`). Set `CHROMIUM_BIN` to an absolute browser path to use an installed Chromium instead of the Playwright browser. The build checks missing images and content overflow before producing the PDF.

From the repository root:

```sh
npm run whitepapers:build:paper2
```

This builds `packages/apiops-presentations/output/from-api-readiness-to-sustainable-quality.pdf` and checks its page count against the source. Open the PDF and check every page, including text, tables, the metro map, links and footers. Page count alone does not detect all overflow.

After reviewing the PDF:

```sh
npm run whitepapers:build:paper2 -- --stage
```

This rebuilds and replaces **only** Paper 2's public PDF, cover preview and manifest entry. Commit those generated files with the source. Normal site builds use the tracked public artifacts without running Chromium.

The existing `whitepapers:stage` command imports the complete separate authoring kit and can overwrite Paper 2 with an older edition. When using that workflow, first reconcile this revised source with that kit; otherwise run the Paper 2 build/stage command last and review the resulting edition. Paper 1 and the supporting pack remain sourced from their existing kit.

## Editorial review

Check that the paper answers why problems recur, distinguishes assessment from improvement, and connects consumer consequences with ownership and investment before explaining the method. The metro map marks a selected practice rather than passed criteria. Strategy and architecture dependencies remain explicit. Replay handling is a proposed server-enforced design; the example makes no implementation, executed-test or measured-benefit claims.

Original text and APIOps artwork: Marjukka Niinioja / Osaango Ltd, CC-BY-SA 4.0. Adapted canvas templates additionally credit Alexander Osterwalder. Independently referenced works retain their own terms.

The release hold in `docs/whitepaper-partner-review.md` still applies: keep the PR in draft; do not merge or deploy until the publication date is agreed.
