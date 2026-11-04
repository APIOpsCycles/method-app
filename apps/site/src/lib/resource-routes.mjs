/** Return the public route parameter encoded in a resource slug. */
export const resourceRouteSegment = (resource) => resource.slug.replace(/^resources\//, "");

/** Return the canonical localized URL for a public resource. */
export const resourcePath = (locale, resource) =>
  `${locale === "en" ? "" : `/${locale}`}/resources/${resourceRouteSegment(resource)}`;

/** CanvasCreator uses canonical canvas IDs, which can differ from resource IDs. */
export const canvasCreatorUrl = (locale, resource) => resource.canvasId
  ? `https://canvascreator.apiopscycles.com/?${new URLSearchParams({ locale, canvas: resource.canvasId })}`
  : undefined;
