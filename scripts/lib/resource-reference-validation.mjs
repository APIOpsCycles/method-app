const ALLOWED_REFERENCE_STATUSES = new Set(["external", "unpublished"]);

function referenceStatus(step, resource) {
  if (step.resourceStatus !== undefined) return step.resourceStatus;
  if (resource?.publicationStatus !== undefined) return resource.publicationStatus;
  if (resource?.draft === "true" || resource?.daft === "true") return "unpublished";
  return "public";
}

/**
 * Classify station-step resource references and reject stale internal IDs.
 *
 * A catalog draft is an explicit unpublished resource. References that do not
 * have a catalog entry must declare `resourceStatus` as `external` or
 * `unpublished`; otherwise they are assumed to be broken internal references.
 */
export function validateStationStepResourceReferences({
  stations,
  stationStepItems,
  resources,
}) {
  const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
  const publicRoutes = new Set();

  for (const resource of resources) {
    if (referenceStatus({}, resource) !== "public") continue;
    if (!resource.slug?.startsWith("resources/") || resource.slug === "resources/") {
      throw new Error(`Public resource ${resource.id} has no Astro resource route: ${resource.slug ?? "(missing slug)"}`);
    }
    const href = `/${resource.slug}`;
    if (publicRoutes.has(href)) throw new Error(`Duplicate public resource Astro route ${href}`);
    publicRoutes.add(href);
  }

  const classified = new Map();
  const broken = new Map();
  for (const station of stations) {
    for (const step of stationStepItems(station)) {
      if (!step.resource) continue;
      const resource = resourceById.get(step.resource);
      const status = referenceStatus(step, resource);
      const pair = `${station.id} -> ${step.resource}`;
      const href = resource?.slug ? `/${resource.slug}` : null;

      if (status === "public" && resource && publicRoutes.has(href)) continue;
      if (ALLOWED_REFERENCE_STATUSES.has(status)) {
        classified.set(pair, { pair, status });
      } else {
        broken.set(pair, pair);
      }
    }
  }

  if (broken.size) {
    throw new Error(
      `[resource-routes] ${broken.size} broken internal station/resource reference(s): ${[...broken.values()].join(", ")}. ` +
      "Add the resource to the catalog, correct the ID, or explicitly classify the step with resourceStatus 'external' or 'unpublished'.",
    );
  }

  return [...classified.values()];
}
