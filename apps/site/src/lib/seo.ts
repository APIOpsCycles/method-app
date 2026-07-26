import { canonicalUrl } from "../env";
import type { Cycle, Line, Locale, Resource, Role, Station } from "./method-data";
import { publicRouteInventory, routeAlternates, type RouteKind } from "./public-routes";

const inventory = publicRouteInventory();

export function metadataForRoute(kind: RouteKind, locale: Locale, path: string) {
  const route = inventory.find((item) => item.kind === kind && item.locale === locale && item.path === path);
  const alternates = route ? routeAlternates(route, inventory) : undefined;
  const languageAlternates = Object.entries(alternates ?? {}).map(([lang, alternatePath]) => ({ lang, path: alternatePath }));
  return { languageAlternates, xDefaultPath: alternates?.en };
}

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: canonicalUrl(item.path) })),
  };
}

export function websiteJsonLd(locale: Locale, name: string, description: string, path: string) {
  return [{ "@context": "https://schema.org", "@type": "WebSite", name, description, inLanguage: locale, url: canonicalUrl(path) }];
}

type LearningEntity = Cycle | Station | Role | Resource;
export function learningResourceJsonLd(entity: LearningEntity, locale: Locale, path: string, trail: { name: string; path: string }[]) {
  const description = "description" in entity ? entity.description : entity.summary;
  return [
    { "@context": "https://schema.org", "@type": "LearningResource", name: entity.title, description, inLanguage: locale, url: canonicalUrl(path) },
    breadcrumbs(trail),
  ];
}

export function itemListJsonLd(line: Line, cycle: Cycle, locale: Locale, path: string, stationPath: (station: Station) => string) {
  const stations = cycle.stations.filter((station) => line.stations.includes(station.id));
  return [
    {
      "@context": "https://schema.org", "@type": "ItemList", name: line.title, description: line.description,
      inLanguage: locale, url: canonicalUrl(path),
      itemListElement: stations.map((station, index) => ({ "@type": "ListItem", position: index + 1, name: station.title, url: canonicalUrl(stationPath(station)) })),
    },
    breadcrumbs([{ name: "APIOps Cycles", path: locale === "en" ? "/" : `/${locale}/` }, { name: cycle.title, path: `${locale === "en" ? "" : `/${locale}`}/cycles/${cycle.slug}` }, { name: line.title, path }]),
  ];
}

/** Structured data for a line viewed without selecting a journey cycle. */
export function genericLineJsonLd(line: Line, stations: Station[], locale: Locale, path: string, stationPath: (station: Station) => string) {
  const lineStations = line.stations.flatMap((id) => stations.filter((station) => station.id === id));
  return [
    {
      "@context": "https://schema.org", "@type": "ItemList", name: line.title, description: line.description,
      inLanguage: locale, url: canonicalUrl(path),
      itemListElement: lineStations.map((station, index) => ({ "@type": "ListItem", position: index + 1, name: station.title, url: canonicalUrl(stationPath(station)) })),
    },
    breadcrumbs([{ name: "APIOps Cycles", path: locale === "en" ? "/" : `/${locale}/` }, { name: line.title, path }]),
  ];
}
