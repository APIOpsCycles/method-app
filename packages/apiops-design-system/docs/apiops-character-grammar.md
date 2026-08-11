# APIOps Character Grammar

The APIOps human assets are not only brand illustrations. They are a notation layer for showing collaboration, ownership, alignment, and digital capability design in a way that can be composed consistently across slides, canvases, social posts, and product UI.

The grammar has five layers:

| Layer | Current examples | Role in the notation |
| --- | --- | --- |
| Pose | `pose-thinking`, `pose-presenting`, `pose-listening`, `pose-holding-interface`, `pose-announcing` | What the actor is doing. This carries the verb of the scene. |
| Expression | Looking, questioning, amazed, announcing, neutral emphasis marks | The actor's state of mind or conversational posture. |
| Symbol | API, contract, board, capability, question, blocker, lifecycle loop | The object or concept being handled. This carries the noun of the scene. |
| Color | Metro line colors, community blue, neutral graphite | The domain, method line, or stakeholder perspective. |
| Meaning | Business, architecture, design, delivery, publishing, community | The intended interpretation when pose, symbol, color, and connection are combined. |

## Standard Human Assets

The grammar is based on the new standalone scarf-human assets in `src/assets/humans`. Do not use `apiops-stick-figures-poses.svg` or `apiops-stick-figures-stories.svg` as grammar sources; those sheets are legacy assets and will be replaced.

| Asset | Grammar role | Canonical pose token |
| --- | --- |
| `pose-with-scarf.svg`, `pose-with-scarf-standing.svg` | Neutral actor. | `pose-standing` |
| `pose-with-scarf-thinking.svg` | Understand, question, diagnose. | `pose-thinking` |
| `pose-with-scarf-presenting.svg` | Explain, teach, share. | `pose-presenting` |
| `pose-with-scarf-announcing.svg` | Publish, call attention, invite. | `pose-announcing` |
| `pose-with-scarf-holding.svg` | Own, carry, offer, hand off. | `pose-holding` |
| `pose-with-scarf-holding-interface.svg` | Present an interface or API surface. | `pose-holding-interface` |
| `pose-with-scarf-holding-computer.svg` | Build, configure, operate. | `pose-holding-computer` |
| `pose-with-scarf-holding-box.svg` | Package a reusable product or capability. | `pose-holding-box` |
| `pose-with-scarf-holding-AI.svg` | AI-assisted design or automation. | `pose-holding-ai` |
| `pose-with-scarf-listening.svg` | Receive, include, learn. | `pose-listening` |
| `pose-with-scarf-amazed.svg` | Surprise, discovery, misalignment revealed. | `pose-amazed` |
| `pose-with-scarf-walking.svg` | Movement, adoption, progress. | `pose-walking` |
| `pose-with-scarf-dancing.svg` | Celebration, shared momentum. | `pose-celebrating` |

Existing method icons that can be reused:

| Source | Symbol IDs | Useful meaning |
| --- | --- | --- |
| `src/assets/icons/apiops-iconset.svg` | `icon-insight`, `icon-decision`, `icon-conversation`, `icon-opportunity`, `icon-capability`, `icon-value`, `icon-people`, `icon-alignment`, `icon-risk`, `icon-quality`, `icon-flow`, `icon-learn` | Method concepts and story anchors. |
| `src/assets/icons/apiops-metro-icons.svg` | `glyph-station`, `glyph-hub`, `glyph-interchange`, `glyph-route-split`, `glyph-arrive`, `glyph-join`, `glyph-explore`, `glyph-decide`, `glyph-continue`, `glyph-learn`, `glyph-iterate`, `glyph-publish`, `glyph-measure`, `glyph-shared-momentum`, `glyph-passengers`, `glyph-waiting`, `glyph-workshop`, `glyph-meetup`, `glyph-conference`, `glyph-speaker` | Route, lifecycle, event, and collaboration structures. |
| `src/assets/icons/apiops-character-notation.svg` | `symbol-api`, `symbol-contract`, `symbol-board`, `symbol-question`, `symbol-alert`, `symbol-stop`, `symbol-rocket`, `symbol-product-cube`, `symbol-standard-placard`, `connection-chaos`, `connection-branching`, `connection-ownership-claim` | Character-grammar notation blocks and connection styles. |
| `src/assets/humans/apiops-character-scenes.svg` | `scene-chaos-to-capabilities`, `scene-api-lifecycle-loop`, `scene-team-celebration`, plus numbered mockup scene recipes | Generated scene recipes for campaign and workshop layouts. |

## Scene Generation Workflow

`src/assets/humans/apiops-character-scenes.svg` is generated. Do not edit that SVG by hand.

Edit these files instead:

| File | Purpose |
| --- | --- |
| `src/assets/character-scenes/scenes.json` | Scene canvas size, preview cards, and ordered layer recipes. |
| `src/assets/character-scenes/registry.json` | Stable pose, symbol, connection, glyph, brand, and color aliases used by scene recipes. |
| `src/assets/humans/pose-with-scarf-*.svg` | Source pose geometry. |
| `src/assets/icons/apiops-character-notation.svg` | Source notation symbols and connection symbols. |
| `src/assets/glyphs/*.svg`, `src/assets/brand/*.svg` | Optional glyph and brand assets that can be referenced from `registry.json`. |

After editing `scenes.json` or `registry.json`, regenerate the SVG:

```powershell
node scripts\build-character-scenes.mjs
```

This updates:

```text
src/assets/humans/apiops-character-scenes.svg
```

For the full package build, run:

```powershell
npm.cmd run build
```

The full build runs `build-character-scenes.mjs` before copying `src/assets` to `dist`, so package consumers continue to use the unchanged public path:

```ts
designSystemAssets.humans.characterScenes
```

Before committing scene changes, run:

```powershell
npm.cmd test
```

The tests check that generated scenes keep stable IDs, inline pose, notation, glyph, and brand geometry, avoid `<image>` tags, avoid unresolved `href="#symbol-*"` or `href="#connection-*"` references, and render as a valid SVG sheet.

Scene recipes use explicit coordinates in V1. Add or tune a scene by changing JSON layers, then regenerate the SVG. Keep reusable IDs semantic, for example `scene-api-ownership-question`, rather than tying IDs to a campaign slide number.

### Registry Symbol References

`registry.json` symbol aliases use package-local SVG references:

```json
{
  "symbols": {
    "api": "icons/apiops-character-notation.svg#symbol-api",
    "apiops-stationblue": "glyphs/apiops-station-circle-blue.svg#apiops-station-circle-blue",
    "apiops-cycles-logo": "brand/apiops-cycles-logo.svg#apiops-logo"
  }
}
```

For sprite-style files, the fragment must match a `<symbol id="...">` or `<g id="...">`. For standalone exported SVGs, the fragment ID becomes the generated scene symbol ID, so a layer can still use a stable alias even if the source file is not a sprite. The source file still controls the actual geometry and colors, so a blue-only station must point to `apiops-station-circle-blue.svg`, not the multicolor station file. The generator inlines only aliases referenced by `scenes.json` and prefixes the generated IDs with `scene-`, for example `scene-apiops-station-circle-blue`.

### Scene Actor Controls

Actor layers support these controls:

| Property | Use |
| --- | --- |
| `pose` | Selects a source pose from `registry.json`. |
| `x`, `y`, `width`, `height` | Places and scales the actor in the scene viewBox. |
| `color` | Sets the scarf color for backward-compatible recipes. |
| `scarfColor` | Explicit scarf color alias. Prefer this in new recipes. |
| `flipX` | Mirrors the actor horizontally so the eye or mouth dot and body posture face the other direction. |
| `crop: "torso"` | Draws a torso-only actor for consumer or audience markers where legs would add noise. |

Scene generation converts the source pose scarf fills to `currentColor`, so `color` or `scarfColor` controls the scarf per actor. The original pose files still own the default eye or mouth dot. Use `flipX` when the same expression needs to face into a composition, such as ownership scenes where actors point toward the central API.

Notation symbols are inlined without their source accent dots in generated scenes. This avoids random-looking blue dots on API, contract, standard, and connection blocks. Use station dots, scarf colors, and explicit scene marks for semantic color instead.

Current source poses cover the first configurable scene set, but these additional source poses would make future scenes cleaner:

| Needed pose | Why |
| --- | --- |
| `pose-reaching` | Governance, ownership, and handoff scenes where a person points to a shared object without holding it. |
| `pose-celebrating-raised-arms` | The final “Together” scene in the campaign mock has raised arms, not walking/dancing legs. |
| `pose-half-listening` | Consumer/audience markers currently use `crop: "torso"`; a dedicated half-human source pose would be cleaner. |
| `pose-facing-left-*` variants, optional | `flipX` works for composition, but source-authored left/right variants would allow more intentional eye and mouth placement. |

## Layer Rules

### Pose

Use poses as verbs. A scene should remain readable if the label is removed.

| Pose | Current token | Meaning | Use when |
| --- | --- | --- |
| Standing | `pose-standing` | Presence, role, neutral participant | A person is part of a system but not taking action yet. |
| Walking | `pose-walking` | Change, adoption, movement | A capability, team, or stakeholder is moving through a process. |
| Presenting | `pose-presenting` | Explain, teach, share | A person makes work visible to others. |
| Announcing | `pose-announcing` | Publish, invite, call attention | A person broadcasts a message or opens participation. |
| Listening | `pose-listening` | Discovery, inclusion, consumer perspective | The actor receives input or signal. |
| Thinking | `pose-thinking` | Diagnose, uncertainty, strategy | The scene starts with confusion, questions, or analysis. |
| Holding | `pose-holding` | Own, carry, offer, hand off | A person is responsible for a symbol or artifact. |
| Holding interface | `pose-holding-interface` | API surface, interface, contract visibility | A person shows the thing others will consume. |
| Holding computer | `pose-holding-computer` | Build, configure, operate | A person works on the implementation or tooling. |
| Holding box | `pose-holding-box` | Package, productize, make reusable | A person turns an artifact into a reusable capability. |
| Holding AI | `pose-holding-ai` | Automate, augment, assist | A person applies AI to method or delivery work. |
| Amazed | `pose-amazed` | Discovery, mismatch revealed | A person sees something unexpected. |
| Celebrating | `pose-celebrating` | Shared success, momentum | A team has reached alignment or outcome. |

### Expression

Expression is a modifier, not a separate character type. Keep the body style stable and change only the minimum visual marks needed.

| Expression token | Meaning | Example mark |
| --- | --- | --- |
| `expression-neutral` | Default, calm collaboration | Plain head, small scarf accent. |
| `expression-questioning` | Unknown ownership, unclear API, missing shared picture | Question mark near head. |
| `expression-alert` | Risk, chaos, blocker, urgent attention | Exclamation mark or short emphasis rays. |
| `expression-amazed` | Discovery, surprise, mismatch made visible | Wide attention mark or raised posture. |
| `expression-speaking` | Announcement, instruction, invitation | Megaphone or speech rays. |
| `expression-looking` | Observe, inspect, consumer view | Eye direction, telescope, or line of sight. |

### Symbol

Use symbols as nouns. They should be simple enough to combine with any pose.

| Symbol token | Meaning | Existing support |
| --- | --- | --- |
| `symbol-capability` | Reusable business capability | `icon-capability` exists. |
| `symbol-alignment` | Shared picture, common route | `icon-alignment`, `glyph-join`, `glyph-shared-momentum` exist. |
| `symbol-api` | API or interface as a product surface | `apiops-character-notation.svg#symbol-api`. |
| `symbol-contract` | API contract or agreement | `apiops-character-notation.svg#symbol-contract`. |
| `symbol-board` | Workshop board, canvas, shared model | `apiops-character-notation.svg#symbol-board`. |
| `symbol-question` | Uncertainty, unclear ownership | `apiops-character-notation.svg#symbol-question`. |
| `symbol-blocker` | Governance stop, dependency constraint | `apiops-character-notation.svg#symbol-blocker`. |
| `symbol-standard` | OpenAPI, AsyncAPI, GraphQL, policy | `apiops-character-notation.svg#symbol-standard` and `#symbol-standard-placard`. |
| `symbol-lifecycle` | API lifecycle or method cycle | `apiops-character-notation.svg#symbol-lifecycle`; full recipe in `apiops-character-scenes.svg#scene-api-lifecycle-loop`. |
| `symbol-publish` | Launch, release, external availability | `apiops-character-notation.svg#symbol-publish` and `#symbol-rocket`. |

### Color

Color is semantic, not decorative. Scarves, station dots, small symbols, and route strokes can carry domain meaning.

| Token | Color | Meaning |
| --- | --- | --- |
| `color.line.business` | `#10b981` | Business, outcomes, understanding. |
| `color.line.architecture` | `#8b5cf6` | Architecture, structure, definition. |
| `color.line.design` | `#ef4444` | Design, contracts, user-facing API decisions. |
| `color.line.delivery` | `#f5b30b` | Delivery, build, implementation. |
| `color.line.publishing` | `#00a6a6` | Publishing, enablement, community readiness. |
| `color.line.operatingModel` | `#1d4ed8` | Governance, operating model, community. |
| `color.neutral.graphite` | `#0f172a` | Body strokes, text, stable structure. |
| `color.neutral.cloud` | `#f5f7fa` | Quiet backgrounds and social post surfaces. |

### Connections

Connections describe relationships between actors and symbols.

| Connection token | Meaning | Visual rule |
| --- | --- | --- |
| `connection-flow` | Intentional process or lifecycle | Solid or gently curved line with arrow. |
| `connection-dependency` | Dependency, ownership input, API call | Dashed line with arrow. |
| `connection-chaos` | Misalignment, tangled dependencies | Dashed looping paths that cross, but avoid unreadable knots. |
| `connection-alignment` | Shared line, method route, ordered progress | Straight route with station dots. |
| `connection-feedback` | Learning loop | Curved loop with arrow returning to earlier node. |
| `connection-boundary` | Governance or organizational boundary | Gap, stop sign, or explicit divider. |

## Meaning Recipes

Compose scenes from small stable recipes:

| Message | Composition |
| --- | --- |
| "Nobody has a shared picture." | Two questioning actors plus `connection-chaos` around API/contract symbols. |
| "Teams optimize locally." | Separate actors standing on separate symbol blocks; no connecting line. |
| "Consumers care about capabilities, not org charts." | Listening or neutral actor above capability/API blocks, with outbound dependency arrows. |
| "Governance blocks innovation." | Stop symbol between governance actor and builder/publisher actor. |
| "API-first is not enough." | Actor holding API symbol, arrow to actor holding capability/product package. |
| "Lifecycle is not a straight line." | Loop of roles, symbols, and feedback route. |
| "Ownership is unclear." | Central API symbol receiving dashed arrows from multiple actors. |
| "Standards do not solve communication." | Actors hold standard placards while one actor remains disconnected or questioning. |
| "Together, we fix chaos." | Route line, station dots, multiple actors with complementary scarves and shared upward emphasis. |

## Mock Scene Analysis

The attached campaign mock shows these target scenes:

| Scene | Current scarf-human blocks used | Building blocks |
| --- | --- | --- |
| Hero chaos cluster | `pose-thinking`, `pose-standing`, `pose-presenting`, `connection-chaos` style, question and alert expressions | Implemented: `symbol-api`, `symbol-contract`, `symbol-field`, `connection-chaos`, `symbol-code-brackets`, `symbol-curly-contract`. |
| Hero aligned route | Thinking, presenting, holding/building, announcing/listening poses; metro station line | Implemented: `scene-chaos-to-capabilities`; station labels for Understand, Define, Design, Build, Enable. |
| 01 Everyone has APIs | Two questioning actors, API/contract blocks, chaotic dashed path | Implemented: `symbol-question`, `symbol-api`, `symbol-contract`, `connection-chaos`. |
| 02 Every team optimizes locally | Three actors on separate blocks | Implemented: `symbol-local-api-block`, `symbol-local-contract-block`, `symbol-local-system-block`; optional isolation boundary remains layout-level. |
| 03 Consumers do not care about org chart | One listening or standing actor above API A/B/C blocks with branching dependencies | Implemented: `symbol-api-card`, `connection-branching`, `symbol-consumer-group`. |
| 04 Governance vs innovation | Stop sign between governance actor and launching builder | Implemented: `symbol-stop`, `symbol-rocket`, `connection-gap`; governance actor remains a scarf/color recipe. |
| 05 API-first is not enough | Actor with API block moving to actor with package/capability cube | Implemented: `symbol-product-cube`, `symbol-capability-package`, `connection-conversion-arrow`. |
| 06 API lifecycle is not a straight line | Circular lifecycle with roles, cube, code, gear, megaphone, consumers | Implemented: `scene-api-lifecycle-loop`, `symbol-architecture-cube`, `symbol-code-design`, `symbol-delivery-gear`, `symbol-feedback-megaphone`, `symbol-consumer-group`. |
| 07 Who owns the API? | Central API symbol with dashed arrows from multiple actors | Implemented: `symbol-ownership-api`, `connection-ownership-claim`. |
| 08 Standards do not solve communication | Actors holding OpenAPI, AsyncAPI, GraphQL placards, disconnected listener | Implemented: `symbol-standard-placard`, `symbol-standard`, `connection-missing-conversation`. |
| Bottom invitation cards | Megaphone actor, board actor, group celebration | Implemented: `symbol-megaphone`, `symbol-workshop-board`, `scene-team-celebration`, `symbol-check-bullet`. |

## Implemented Building Blocks

These blocks are available as small symbols for campaign scene composition. Use `src/assets/icons/apiops-character-notation.svg` for symbols and connection styles, and `src/assets/humans/apiops-character-scenes.svg` for composed scene recipes.

| ID | Type | Source |
| --- | --- | --- |
| `symbol-api`, `symbol-api-card`, `symbol-contract`, `symbol-code-brackets`, `symbol-curly-contract`, `symbol-field` | API notation symbols | `apiops-character-notation.svg` |
| `symbol-question`, `symbol-alert`, `symbol-stop`, `symbol-blocker` | Expression and blocker symbols | `apiops-character-notation.svg` |
| `symbol-board`, `symbol-workshop-board`, `symbol-standard`, `symbol-standard-placard`, `symbol-standard-placard-blank`, `symbol-check-bullet` | Workshop and communication symbols | `apiops-character-notation.svg` |
| `symbol-rocket`, `symbol-publish`, `symbol-product-cube`, `symbol-capability-package` | Publishing and productization symbols | `apiops-character-notation.svg` |
| `symbol-architecture-cube`, `symbol-code-design`, `symbol-delivery-gear`, `symbol-feedback-megaphone`, `symbol-megaphone`, `symbol-consumer-group` | Lifecycle role symbols | `apiops-character-notation.svg` |
| `connection-chaos`, `connection-branching`, `connection-ownership-claim`, `connection-missing-conversation`, `connection-gap`, `connection-conversion-arrow` | Connection styles | `apiops-character-notation.svg` |
| `scene-chaos-to-capabilities`, `scene-shared-picture-missing`, `scene-local-optimization`, `scene-consumers-capabilities`, `scene-governance-vs-innovation`, `scene-api-first-not-enough`, `scene-api-lifecycle-loop`, `scene-api-ownership-question`, `scene-standards-without-conversation`, `scene-feedback-invitation`, `scene-workshop-invitation`, `scene-team-celebration` | Scene recipes | `apiops-character-scenes.svg` |

## Naming Rules

Use predictable IDs:

- Poses: `pose-{verb}`, for example `pose-thinking`.
- Expressions: `expression-{state}`, for example `expression-questioning`.
- Symbols: `symbol-{noun}`, for example `symbol-contract`.
- Connections: `connection-{relationship}`, for example `connection-ownership-claim`.
- Scenes: `scene-{message}`, for example `scene-chaos-to-capabilities`.

Do not encode campaign names, event names, or slide numbers in reusable asset IDs. Those belong in consuming layouts.

## Composition Rules

- Prefer one clear verb per actor.
- Use no more than one semantic color per actor unless the scene is explicitly about conflict or handoff.
- Keep API and contract symbols visually distinct: API means usable interface; contract means agreement/specification.
- Use dashed lines only for uncertainty, dependency, ownership claims, or chaos. Use solid lines for intentional method flow.
- Keep text labels outside the symbol when the symbol must be reused across languages. Use placards only when the text itself is the concept, such as OpenAPI, AsyncAPI, or GraphQL.
- Compose from symbols first, then add characters. If the scene is unreadable without characters, the method concept is probably not stable enough yet.
