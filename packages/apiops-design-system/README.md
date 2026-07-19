# @apiops/design-system

The deliberately small APIOps visual foundation: tokens, CSS, assets, metadata, and reusable React canvas primitives.

```tsx
import "@apiops/design-system/styles.css";
import { CanvasSystemShell, StakeholderRoleSelector } from "@apiops/design-system/react";
import { designSystemAssets, designSystemAssetManifest } from "@apiops/design-system/assets";
```

The React entry point includes the canvas shell, grid, zones, notes, and metadata
controls as well as the stakeholder-role selector and involvement legend used by
the metro map.

This package owns visual concepts only. Method catalogs, cycle and station data, canvas content, and APIOps method IDs stay in `apiops-cycles-method-data` or the consuming application.

Applications import `styles.css` once in their root layout and use the asset entry
point for public paths and inventory metadata. They should not copy assets or repeat
the `/design-system` mount convention. The React components accept all method and
localized content through props; this package must not import generated catalogs.
Run `npm run check:design-system-boundaries` from the repository root to verify
these ownership and integration rules.

## Versioning

- Patch: fixes, docs, and compatible visual refinements.
- Minor: new tokens, components, or assets.
- Major: renamed tokens/classes or changed component APIs.
