import { defaultLocale, getCatalog, locales, localePrefix, publicResources, resourcePath, type Locale } from "./method-data";

export type RouteKind = "home" | "cycle" | "station" | "cycleStation" | "role" | "resource" | "line" | "partners" | "licensing" | "data" | "designSystem";
export type PublicRoute = { kind: RouteKind; locale: Locale; path: string; alternateKey?: string };

/** One indexing policy shared by sitemap and future route discovery surfaces. */
export function publicRouteInventory(): PublicRoute[] {
  const localized = locales.flatMap((locale) => {
    const data = getCatalog(locale);
    const prefix = localePrefix(locale);
    return [
      { kind: "home", locale, path: `${prefix}/`, alternateKey: "home" },
      { kind: "partners", locale, path: `${prefix}/partners`, alternateKey: "partners" },
      { kind: "licensing", locale, path: `${prefix}/licensing`, alternateKey: "licensing" },
      { kind: "data", locale, path: `${prefix}/data`, alternateKey: "data" },
      ...data.cycles.map((cycle) => ({ kind: "cycle" as const, locale, path: `${prefix}/cycles/${cycle.slug}`, alternateKey: `cycle:${cycle.id}` })),
      ...data.stations.map((station) => ({ kind: "station" as const, locale, path: `${prefix}/stations/${station.id}`, alternateKey: `station:${station.id}` })),
      ...data.cycles.flatMap((cycle) => cycle.stations.map((station) => ({ kind: "cycleStation" as const, locale, path: `${prefix}/cycles/${cycle.slug}/stations/${station.id}`, alternateKey: `cycleStation:${cycle.id}:${station.id}` }))),
      ...data.routeProfiles.map((role) => ({ kind: "role" as const, locale, path: `${prefix}/roles/${role.id}`, alternateKey: `role:${role.id}` })),
      ...publicResources(locale).map((resource) => ({ kind: "resource" as const, locale, path: resourcePath(locale, resource), alternateKey: `resource:${resource.id}` })),
      ...data.cycles.flatMap((cycle) => data.lines.filter((line) => line.stations.some((id) => cycle.stations.some((station) => station.id === id))).map((line) => ({ kind: "line" as const, locale, path: `${prefix}/cycle/${cycle.slug}/lines/${line.slug}`, alternateKey: `line:${cycle.id}:${line.id}` }))),
    ] satisfies PublicRoute[];
  });
  // Compatibility /method routes are deliberately absent. This English-only route has no alternates.
  return [...localized, { kind: "designSystem", locale: defaultLocale, path: "/design-system" }];
}

export function routeAlternates(route: PublicRoute, inventory: PublicRoute[]) {
  if (!route.alternateKey) return undefined;
  return Object.fromEntries(inventory.filter((item) => item.alternateKey === route.alternateKey).map((item) => [item.locale, item.path]));
}
