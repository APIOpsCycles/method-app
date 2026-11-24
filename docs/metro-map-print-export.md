# Metro map exports for larger print

The website's existing Export SVG button keeps the actual paths, text and inline
vector logo, with explicit colours and no external image dependencies. Its
intrinsic long edge is now 16,384 pixels, while the geometric viewBox stays
unchanged. The live on-screen map is not enlarged or mutated during export.

Substation lettering is now 14 viewBox units rather than 11 (27% larger), with
700 weight, in both the interactive map and the SVG download. Longer names wrap
without abbreviating them. Technical stations have wider vertical spacing for
translated names. Main station labels retain their on-screen 12-unit size in the
export; they were previously reduced to 10 units by the export stylesheet.

Pixel count and legibility are separate concerns. At a 90mm map width, even the
new 14-unit lettering is only about 3.6pt. Use the complete map for orientation in
a small booklet and enlarged excerpts for station detail. Increasing the export
dimensions alone cannot increase text size relative to the map.

Use the SVG for rollups, posters and other large-format layouts. It is scalable
vector artwork; the intrinsic pixel dimensions are an import hint, not a fixed
resolution limit. A large default helps applications that rasterize an imported
SVG. Their own import limits can still affect the raster they produce. Text
remains text using the declared Arial/sans-serif fonts, so the print workflow
should retain those fonts or outline them in its final production file.

The presentation helper downloads through that exact website button. Its PNG
fallback remains 4,096px by default, keeping routine presentation builds small.
Choose a larger raster explicitly when required:

```powershell
node packages/apiops-presentations/scripts/export-metro-assets.mjs http://127.0.0.1:4321/ apiops-metro-capability-print 8192
```

The optional last argument accepts a longest edge from 1,024 to 16,384 pixels.
SVG dimensions and geometry are independent of this PNG setting. Output files
are written under the presentation package's `assets/` and `output/` directories.
Very large PNGs require more memory; use the SVG when the layout application
supports it. Colour conversion and bleed belong to the final rollup/poster layout.

Regression checks exercise every English cycle and all five site languages, parse the
downloaded XML, check 16K dimensions and the original viewBox, confirm native
paths/text with no bitmap images, and check the larger exported label sizes.
They also check that substation names remain complete, do not overlap other
labels or fall outside the circular crop, and that exporting leaves the live map
unchanged. This source change requires the normal website deployment before it
affects downloads from the public site.
