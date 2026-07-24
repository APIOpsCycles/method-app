# @apiops/design-system

The deliberately small APIOps visual foundation: tokens, CSS, assets, metadata, and reusable React canvas primitives.

```tsx
import "@apiops/design-system/styles.css";
import { CanvasSystemShell, StakeholderRoleSelector } from "@apiops/design-system/react";
import { designSystemAssets, designSystemAssetManifest } from "@apiops/design-system/assets";
```

Focused React entry points are available at `/react/canvas`, `/react/metro`, and
`/react/patterns`. Visual-contract fixtures live under `/testing` so production
consumers do not need to make demonstration utilities part of their public API.

The React entry point includes the canvas shell, grid, zones, notes, and metadata
controls. `CanvasSystemFixture` renders every mode and the complete canvas visual-state
contract for regression and accessibility review.

The application owns method definitions, persistence, schema validation, locale,
downloads, and attribution. This package owns canvas presentation, accessible
interaction states, notes, metadata controls, and print treatments.
The entry point also includes selectors for stakeholder roles and resources; compact sections,
pill lists, partner cards, and announcement toasts. Every component is
method-agnostic and receives its content and localized labels through props.

This package owns visual concepts only. Method catalogs, cycle and station data, canvas content, and APIOps method IDs stay in `apiops-cycles-method-data` or the consuming application.

Applications import `styles.css` once in their root layout and use the asset entry
point for public paths and inventory metadata. They should not copy assets or repeat
the `/design-system` mount convention. The React components accept all method and
localized content through props; this package must not import generated catalogs.
Run `npm run check:design-system-boundaries` from the repository root to verify
these ownership and integration rules.

## Assets

The default named asset inventory uses `/design-system`. Applications deployed at a
subpath or behind a CDN can call `createDesignSystemAssets(basePath)` or pass a base
path to `designSystemAssetPath(path, basePath)`.

Copy the complete asset catalog from an installed package with:

```bash
apiops-design-system copy-assets --output public/design-system --public-base /design-system
```

The CLI resolves its source relative to the installed module, so consumers do not
need to reproduce this repository's workspace layout.

## Publishing

`npm pack` and `npm publish` run the package build through `prepack`. Validate a
release candidate with `npm test` and inspect `npm pack --dry-run --json`; all public
exports and the asset-copy CLI must be present in the resulting tarball.

## Versioning

- Patch: fixes, docs, and compatible visual refinements.
- Minor: new tokens, components, or assets.
- Major: renamed tokens/classes or changed component APIs.
