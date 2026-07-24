# Method context and generated relationships

Canonical method entities remain in the `apiops-cycles-method-data` package under `src/data/method`; `scripts/sync-method-data.mjs` localizes and copies that source into build-only catalogs. The small, canonical goal list is `data/method-goals.json`. Goal IDs are stable and their cycle/station references must use canonical method IDs.

`npm run build:method-graph` reads the generated English catalog (relationships are language-independent), validates every cycle, station, stakeholder and resource reference, deduplicates and sorts adjacency, then writes `method-graph.json` and localized `method-goals.json` to `generated/method` and `public/data`. These outputs are generated and must not be edited. The normal data sync, development and production build pipelines regenerate them automatically. To add a relationship, change the upstream canonical method data; to add a goal, edit the canonical goal file and run the generator. Invalid references fail generation with the owning entity and missing ID.

Astro uses `src/lib/method-graph.ts` for static page context and compact props. React islands consume only map-sized station adjacency, not content Markdown. `src/lib/method-context.ts` shares the selected stakeholder and goal between islands with React's external-store API. It persists only those selections under `apiops.methodContext.v1`, migrates the former `apiops.selectedStakeholder` and `selectedStakeholder` values, and never stores page-derived cycle/station arrays. Page context continues to come from route props.

Map emphasis is deterministic: a station matching both selections is strong, either selection is medium, and every other station remains normally visible. Next-step candidates come only from generated cycle adjacency and are sorted by contextual emphasis and then canonical ID. This is explainable navigation, not an AI recommendation or runtime graph database.

## Resolution rules

State has three deliberately separate layers. Only `stakeholderId` and `goalId` are persistent. Recommended cycle, entry station, relevant stations, and involvement are recalculated from the graph. Current cycle and station always come from the route; direct links and manual map navigation are never redirected.

`resolve-method-context.ts` owns all weights. A directly recommended goal cycle scores 100, a cycle containing a directly goal-related station scores 60, and the strongest role involvement adds 30 (lead), 20 (core), or 10 (consulted). A cycle with no role mapping scores -50. Equal scores retain generated canonical cycle order. Inside the winning cycle, a goal-and-role match ranks before a role-only match, then a goal-only match; involvement and canonical station order break ties. Thus the first journey station is only a final fallback, not the default personalized entry.

The localStorage reader validates IDs and rewrites the v1 object with only the two supported fields, removing old route/recommendation fields. Change scoring only through the exported constants and resolver tests. When adding or changing stakeholder mappings upstream, regenerate the graph and add a resolver assertion covering the expected involvement and earliest meaningful station.
