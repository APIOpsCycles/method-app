import routeIndex from "generated-data/route-index.json";
import catalogEn from "generated-data/method-catalog.en.json";
import catalogFi from "generated-data/method-catalog.fi.json";
import catalogFr from "generated-data/method-catalog.fr.json";
import catalogDe from "generated-data/method-catalog.de.json";
import catalogPt from "generated-data/method-catalog.pt.json";

const catalogs = {
  en: catalogEn,
  fi: catalogFi,
  fr: catalogFr,
  de: catalogDe,
  pt: catalogPt,
} as const;

export type Locale = keyof typeof catalogs;
export type Translation = (typeof catalogEn)["translations"]["en"];
export type Cycle = Translation["cycles"][number];
export type Station = Translation["stations"][number];
export type Resource = Translation["resources"][number];
export type RouteProfile = Translation["routeProfiles"][number];

const supportedLocales = routeIndex.locales as Locale[];
export const defaultLocale = routeIndex.defaultLocale as Locale;
export const siteOrigin =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  process.env.SITE_ORIGIN ??
  "https://beta.apiopscycles.com";

export function normalizeLocale(locale?: string): Locale {
  return supportedLocales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export function localePrefix(locale: Locale) {
  return locale === defaultLocale ? "" : `/${locale}`;
}

export function canonicalPath(locale: Locale, path: string) {
  return `${localePrefix(locale)}${path}`;
}

export function canonicalUrl(locale: Locale, path: string) {
  return `${siteOrigin}${canonicalPath(locale, path)}`;
}

export function getCatalog(locale?: string) {
  const normalized = normalizeLocale(locale);
  return catalogs[normalized].translations[normalized] as Translation;
}

export function getPublicRouteIndex() {
  return routeIndex;
}

export function getPublicCycles(locale?: string) {
  return getCatalog(locale).cycles;
}

export function getPublicStations(locale?: string) {
  return getCatalog(locale).stations;
}

export function getPublicResources(locale?: string) {
  return getCatalog(locale).resources.filter((resource) => !resource.draft);
}

export function getPublicRouteProfiles(locale?: string) {
  return getCatalog(locale).routeProfiles;
}

export function getCycleBySlug(slug: string, locale?: string) {
  return getPublicCycles(locale).find((cycle) => cycle.slug === slug || cycle.id === slug);
}

export function getStationBySlug(slug: string, locale?: string) {
  return getPublicStations(locale).find(
    (station) => station.id === slug || station.slug === slug || station.slug === `method/${slug}`,
  );
}

export function getResourceBySlug(slug: string, locale?: string) {
  return getPublicResources(locale).find(
    (resource) => resource.id === slug || resource.slug === slug || resource.slug === `resources/${slug}`,
  );
}

export function getStakeholderBySlug(slug: string, locale?: string) {
  return getPublicRouteProfiles(locale).find(
    (profile) => profile.id === slug || profile.stakeholderId === slug,
  );
}

export function getCycleForStation(stationId: string, locale?: string) {
  return getPublicCycles(locale).find((cycle) =>
    cycle.stations.some((station) => station.id === stationId),
  );
}

export function getRelatedEntities(entity: Cycle | Station | Resource | RouteProfile, locale?: string) {
  const data = getCatalog(locale);
  const id = "id" in entity ? entity.id : "";
  return {
    cycles: data.cycles.filter((cycle) =>
      cycle.id === id ||
      cycle.stations.some((station) => station.id === id || station.resources.some((resource) => resource.id === id)),
    ),
    stations: data.stations.filter((station) =>
      station.id === id || station.resources.some((resource) => resource.id === id),
    ),
    resources: data.resources.filter((resource) => !resource.draft && resource.id === id),
    roles: data.routeProfiles.filter((profile) =>
      profile.id === id ||
      profile.stations.some((station) => station.id === id) ||
      profile.recommendedResources.some((resource) => resource.id === id),
    ),
  };
}

export function languageAlternates(pathForLocale: (locale: Locale) => string) {
  return Object.fromEntries(
    supportedLocales.map((locale) => [locale, canonicalPath(locale, pathForLocale(locale))]),
  );
}

export function absoluteLanguageAlternates(pathForLocale: (locale: Locale) => string) {
  return Object.fromEntries(
    supportedLocales.map((locale) => [locale, canonicalUrl(locale, pathForLocale(locale))]),
  );
}

type PublicPageKind = "home" | "partners" | "licensing" | "cycle" | "station" | "methodStation" | "role" | "resource";

type PublicPage = {
  locale: Locale;
  path: string;
  title: string;
  summary?: string;
  kind: PublicPageKind;
  id?: string;
};

function pathForPage(locale: Locale, kind: PublicPageKind, id?: string) {
  const data = getCatalog(locale);

  switch (kind) {
    case "home":
      return "/";
    case "partners":
      return "/partners";
    case "licensing":
      return "/licensing";
    case "cycle": {
      const cycle = data.cycles.find((item) => item.id === id);
      return cycle ? `/cycles/${cycle.slug}` : "/";
    }
    case "station":
      return `/stations/${id}`;
    case "methodStation":
      return `/method/${id}`;
    case "role":
      return `/roles/${id}`;
    case "resource": {
      const resource = data.resources.find((item) => !item.draft && item.id === id);
      return resource ? `/${resource.slug}` : "/";
    }
  }
}

export function pageLanguageAlternates(kind: PublicPageKind, id?: string) {
  return languageAlternates((locale) => pathForPage(locale, kind, id));
}

export function absolutePageLanguageAlternates(kind: PublicPageKind, id?: string) {
  return absoluteLanguageAlternates((locale) => pathForPage(locale, kind, id));
}

export function allPublicPages() {
  return supportedLocales.flatMap((locale) => {
    const prefix = localePrefix(locale);
    const data = getCatalog(locale);
    return [
      { locale, path: `${prefix}/`, title: "APIOps Cycles Knowledge Catalog", kind: "home" },
      { locale, path: `${prefix}/partners`, title: "APIOps Cycles Partners", kind: "partners" },
      { locale, path: `${prefix}/licensing`, title: "APIOps Cycles Licensing", kind: "licensing" },
      ...data.cycles.map((cycle) => ({
        locale,
        path: `${prefix}/cycles/${cycle.slug}`,
        title: cycle.title,
        summary: cycle.description,
        kind: "cycle",
        id: cycle.id,
      })),
      ...data.stations.map((station) => ({
        locale,
        path: `${prefix}/stations/${station.id}`,
        title: station.title,
        summary: station.description,
        kind: "station",
        id: station.id,
      })),
      ...data.routeProfiles.map((role) => ({
        locale,
        path: `${prefix}/roles/${role.id}`,
        title: role.title,
        summary: role.summary,
        kind: "role",
        id: role.id,
      })),
      ...data.resources.filter((resource) => !resource.draft).map((resource) => ({
        locale,
        path: `${prefix}/${resource.slug}`,
        title: resource.title,
        summary: resource.description,
        kind: "resource",
        id: resource.id,
      })),
    ] satisfies PublicPage[];
  });
}
