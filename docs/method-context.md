# Method context and generated relationships

Canonical method entities remain in the `apiops-cycles-method-data` package under `src/data/method`; `scripts/sync-method-data.mjs` localizes and copies that source into build-only catalogs. The small, canonical goal list is `data/method-goals.json`. Goal IDs are stable and their cycle/station references must use canonical method IDs.

`npm run build:method-graph` reads the generated English catalog (relationships are language-independent), validates every cycle, station, stakeholder and resource reference, deduplicates and sorts adjacency, then writes `method-graph.json` and localized `method-goals.json` to `generated/method` and `public/data`. These outputs are generated and must not be edited. The normal data sync, development and production build pipelines regenerate them automatically. To add a relationship, change the upstream canonical method data; to add a goal, edit the canonical goal file and run the generator. Invalid references fail generation with the owning entity and missing ID.

Astro uses `src/lib/method-graph.ts` for static page context and compact props. React islands consume only map-sized station adjacency, not content Markdown. `src/lib/method-context.ts` shares the selected stakeholder and goal between islands with React's external-store API. It persists only those selections under `apiops.methodContext.v1`, migrates the former `apiops.selectedStakeholder` and `selectedStakeholder` values, and never stores page-derived cycle/station arrays. Page context continues to come from route props.

Map emphasis is deterministic: a station matching both selections is strong, either selection is medium, and every other station remains normally visible. Next-step candidates come only from generated cycle adjacency and are sorted by contextual emphasis and then canonical ID. This is explainable navigation, not an AI recommendation or runtime graph database.

## Resolution rules

State has three deliberately separate layers. Only `stakeholderId` and `goalId` are persistent. Recommended cycle, entry station, relevant stations, and involvement are recalculated from the graph. Current cycle and station always come from the route; direct links and manual map navigation are never redirected.

`resolve-method-context.ts` owns all weights. A directly recommended goal cycle scores 100, a cycle containing a directly goal-related station scores 60, and the strongest role involvement adds 30 (lead), 20 (core), or 10 (consulted). A cycle with no role mapping scores -50. Equal scores retain generated canonical cycle order. Inside the winning cycle, a goal-and-role match ranks before a role-only match, then a goal-only match; involvement and canonical station order break ties. Thus the first journey station is only a final fallback, not the default personalized entry.

The localStorage reader validates IDs and rewrites the v1 object with only the two supported fields, removing old route/recommendation fields. Change scoring only through the exported constants and resolver tests. When adding or changing stakeholder mappings upstream, regenerate the graph and add a resolver assertion covering the expected involvement and earliest meaningful station.

## Quiet context interface

The compact context strip is the sole editor for stakeholder and goal. A first visit gets a dismissible, non-blocking setup prompt; returning visitors get read-only values and a **Change context** button. That button expands an inline, keyboard-accessible editor containing only stakeholder, goal, reset, and close controls. Cycle and station remain route-derived links and are never offered as persistent preferences.

The map consumes the shared store only for emphasis and derived actions. It deliberately contains no stakeholder selector, goal selector, or reset button. Compact cycle tabs remain because they are navigation. The redundant current-station footer and permanent contextual legend were removed; the selected map marker and top strip already communicate that state.

`resolveContextualUiState` derives one of `no-context`, `start`, `on-path`, or `off-path`. A generic page offers the recommended start, an on-path station offers the next relevant station, and an off-path station offers a quiet return action. Current routes are never changed automatically. Add a new primary action by extending this pure resolver, adding localized `map.mode*` and `map.action*` labels in the sync script, and testing the route mode without putting navigation state in storage.

On pages without route-derived cycle or station context, the strip displays the graph-recommended cycle and links to its recommended entry station. It does not advance to the following relevant stop until the user is actually on the path. Route-derived cycles always take precedence when present, so manual exploration remains visible and can be classified as off-path.

Resource pages pass their generated inverse `byResource` station relationships into the resolver. The context guidance links to the resource's earliest use in the recommended cycle, even when the selected stakeholder's involvement starts later. This preserves the resource's actual journey entry point, keeps resource-to-work guidance graph-derived, and avoids rescanning localized content in the client.

Map emphasis uses the union of role and goal relevance. When a stakeholder is selected, their station mappings define the stops on the path and the goal determines which cycle that path belongs to. This keeps later role stops such as an audit in the journey even when the goal does not list the station directly, while preventing goal-only stations from being described as role-relevant. A station is on-path only in the recommended cycle; the same canonical station viewed through another cycle remains valid manual exploration and receives off-path guidance.

The context surface also owns the compact route guidance that was previously split between station-involvement and recommended-start islands. Its four stable headings are **Who**, **Why**, **Where**, and **Cycle**. On station routes it combines the current role involvement with either the next relevant station or a return to the recommended path. Station labels are resolved from the selected cycle's localized station entries, so both the current and next station use cycle-specific naming.

Cycle navigation on the map is route-aware rather than a row of equal selectors. It identifies the cycle currently being viewed and presents the remaining cycles as secondary “Other views” links. On a page without an explicit cycle, the graph-recommended cycle becomes the map view after context hydration; it is never persisted as user context.
