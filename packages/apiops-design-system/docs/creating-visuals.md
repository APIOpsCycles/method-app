## Choose a starting point

| What you need | Start here |
| --- | --- |
| A logo, icon, person or existing scene | [Browse and download design-system assets](/design-system#assets) |
| A reusable, editable scene using the APIOps visual language | Compose an SVG scene from the existing poses and notation symbols |
| A new conceptual illustration for a talk or article | Use approved asset references and the AI image brief below |
| A filled method canvas or metro map | Use the relevant method tool and export its diagram; keep its content and labels accurate |

These approaches work for presentations, websites, workshop material and other communication. Existing symbols and scene recipes are useful when the same visual must remain consistent across formats or languages.

## Reuse existing assets without coding

1. Open the [design-system asset browser](/design-system#assets). The **Character grammar poses** section contains the current scarf-human figures. The [Character scenes section](/design-system#symbols-character-scenes) contains complete scene compositions.
2. Choose **Download SVG** under the individual asset or scene. For a symbol sheet, use the individual download button to obtain a standalone SVG, rather than inserting the entire sheet.
3. Insert the SVG into PowerPoint or your vector editor. Preserve the aspect ratio and leave room around the scene. Edit slide titles and labels as normal presentation text.
4. For a workflow requiring PNG, export the standalone SVG from a vector editor at the size needed for the final output. Prefer a transparent background for a cutout and a white background for a full scene.

The scene gallery includes `scene-chaos-to-capabilities`, `scene-shared-picture-missing` and `scene-api-first-not-enough`. Choose the scene whose meaning fits the point you want to explain. Use the current `pose-with-scarf-*` assets; the older stick-figure pose and story sheets are legacy references.

## Use assets in a website or application

Use the package's asset helpers so the public mount point stays configurable:

```ts
import {
  designSystemAssets,
  designSystemAssetPath,
  createDesignSystemAssets,
} from "apiops-design-system/assets";

const thinkingPerson = designSystemAssets.humans.scarfThinking;
const sceneSheet = designSystemAssets.humans.characterScenes;
const alternateMount = createDesignSystemAssets("/my-assets");
const standingPerson = alternateMount.humans.scarfStanding;
```

Copy the installed catalog to your application's public directory:

```sh
npx apiops-design-system copy-assets --output public/design-system
```

A standalone pose can be used in an image element. A scene inside the sheet is referenced through an SVG `use` element:

```html
<svg viewBox="0 0 560 300" role="img"
     aria-label="People connect API work to reusable capabilities">
  <use href="/design-system/humans/apiops-character-scenes.svg#scene-chaos-to-capabilities"></use>
</svg>
```

The asset browser shows each symbol's actual `viewBox` and a matching markup example. In an application, construct the sheet URL with `designSystemAssetPath("humans/apiops-character-scenes.svg")`; append the scene's fragment ID. Keep meaningful alternative text, or mark a purely decorative SVG `aria-hidden="true"`.

## Compose a new editable SVG scene

The [APIOps Character Grammar](https://github.com/APIOpsCycles/method-app/blob/main/packages/apiops-design-system/docs/apiops-character-grammar.md) explains the visual vocabulary: poses carry actions, symbols carry concepts, and connections express relationships. A scene should convey one clear idea, such as a consumer and an engineer agreeing on an API contract.

In a checkout of the method-app repository, edit these package-owned sources:

- `packages/apiops-design-system/src/assets/character-scenes/scenes.json`: scene definitions, ordered layers and gallery preview entries.
- `packages/apiops-design-system/src/assets/character-scenes/registry.json`: supported pose, symbol and colour aliases.
- `packages/apiops-design-system/src/assets/humans/pose-with-scarf-*.svg`: source geometry when a genuinely new pose is needed.

For example, add an object like this to the `scenes` array. It uses aliases present in the current registry:

```json
{
  "id": "scene-contract-review-example",
  "title": "Review the API contract together",
  "viewBox": "0 0 560 300",
  "layers": [
    { "type": "actor", "pose": "thinking", "x": 45, "y": 110,
      "width": 100, "height": 150, "scarfColor": "design" },
    { "type": "symbol", "symbol": "contract", "x": 225, "y": 90,
      "width": 100, "height": 120, "color": "community" },
    { "type": "actor", "pose": "pointing", "x": 410, "y": 110,
      "width": 100, "height": 150, "scarfColor": "architecture", "flipX": true }
  ]
}
```

Add a corresponding `preview` entry if it should appear on the generated sheet. Use existing entries as placement examples. Keep IDs semantic and unique. The example above is a recipe to add, not an asset already in the gallery.

From the repository root, regenerate and verify the package:

```sh
node packages/apiops-design-system/scripts/build-character-scenes.mjs
npm run build --workspace apiops-design-system
npm test --workspace apiops-design-system
npm run sync:design-system-assets
```

The generator writes `src/assets/humans/apiops-character-scenes.svg`. Edit its recipes and source geometry rather than hand-editing that generated sheet. Keep labels editable or separately localised. Solid connections can show intentional flow; dashed connections can show uncertainty or dependencies. Colour should support the meaning without carrying it alone.

## Brief an AI image generator

Use an approved standalone pose or scene as a visual reference, and describe the action and relationship you need. The design system supplies the reference language; it does not itself generate raster images.

Example brief:

```text
Create a conceptual APIOps illustration using the attached approved
scarf-human reference. Show an engineer at a laptop and a second person
reviewing an API contract, with a simple contract → code → test flow.
Match the reference's figure proportions, head and scarf treatment,
outline weight and simple notation. Use a white background, generous
empty space and dark neutral outlines. Use small architecture and
publishing scarf accents from the supplied palette. Keep text, logos
and API endpoint names out of the generated image; these will be added
as editable slide content. Use a wide composition suitable for the
reserved image area. This is a conceptual scene, not a client photograph.
```

Change the actors, poses and objects to match your message. Request a transparent background when you need a cutout. Check the result against the reference, including hands, symbols, relationships and any accidental lettering. Use official logo assets separately. Record the brief, references, output filename and a short description alongside the image so another contributor can reproduce or revise it.

## Add a visual to the presentation source

The current presentation exporters expect slide image assets as PNG. Export a downloaded or newly composed SVG to PNG for this pipeline; retain the SVG as the editable source. Put the PNG under `packages/apiops-presentations/assets/`, then add an image element in the relevant `slides/*.json` file:

```json
{
  "id": "contract-review-image",
  "type": "image",
  "asset": "contract-review.png",
  "alt": "An engineer and product owner review an API contract together",
  "fit": "contain"
}
```

Add the same element ID to that slide's entry in `layouts.json`:

```json
"contract-review-image": { "x": 680, "y": 240, "w": 520, "h": 340 }
```

Choose a clear area of the layout and adjust the surrounding text if needed. Use `contain` for complete diagrams and scenes; use `cover` only when cropping is appropriate. Rebuild and inspect PowerPoint, PDF and Reveal.js. Changes to a downloaded PowerPoint or exported HTML do not update the shared source.

Keep text black or grey in the current decks; scarf and method accents can retain their semantic colours. Preserve canvas and method attribution, and describe generated scenes as conceptual illustrations in the slide notes. For other applications, choose SVG or PNG according to their rendering needs. See the [presentation developer guide](/presentations/developers) and [licensing page](/licensing) for the related workflows and attribution context.
