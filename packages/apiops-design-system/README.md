# @apiops/design-system

The deliberately small APIOps visual foundation: tokens, CSS, assets, metadata, and reusable React canvas primitives.

```tsx
import "@apiops/design-system/styles.css";
import { CanvasSystemShell } from "@apiops/design-system/react";
```

This package owns visual concepts only. Method catalogs, cycle and station data, canvas content, and APIOps method IDs stay in `apiops-cycles-method-data` or the consuming application.

## Versioning

- Patch: fixes, docs, and compatible visual refinements.
- Minor: new tokens, components, or assets.
- Major: renamed tokens/classes or changed component APIs.