import routeIndex from "../../../beta/app/data/route-index.json";
import catalogEn from "../../../beta/app/data/method-catalog.en.json";
import catalogFi from "../../../beta/app/data/method-catalog.fi.json";
import catalogFr from "../../../beta/app/data/method-catalog.fr.json";
import catalogDe from "../../../beta/app/data/method-catalog.de.json";
import catalogPt from "../../../beta/app/data/method-catalog.pt.json";

const catalogs = { en: catalogEn, fi: catalogFi, fr: catalogFr, de: catalogDe, pt: catalogPt } as const;
export type Locale = keyof typeof catalogs;
export type Catalog = (typeof catalogEn)["translations"]["en"];
export type Cycle = Catalog["cycles"][number];
export type Station = Catalog["stations"][number];
export type Resource = Catalog["resources"][number];
export type Role = Catalog["routeProfiles"][number];

export const defaultLocale = routeIndex.defaultLocale as Locale;
export const locales = routeIndex.locales as Locale[];
export const generatedRouteIndex = routeIndex;
export const localizedLocales = locales.filter((locale) => locale !== defaultLocale);
export const localePrefix = (locale: Locale) => locale === defaultLocale ? "" : `/${locale}`;
export const getCatalog = (locale: Locale = defaultLocale) => catalogs[locale].translations[locale] as Catalog;
export const getCycle = (locale: Locale, slug: string) => getCatalog(locale).cycles.find((item) => item.slug === slug || item.id === slug);
export const getStation = (locale: Locale, slug: string) => getCatalog(locale).stations.find((item) => item.id === slug || item.slug === slug || item.slug === `method/${slug}`);
export const getRole = (locale: Locale, slug: string) => getCatalog(locale).routeProfiles.find((item) => item.id === slug || item.stakeholderId === slug);
export const getResource = (locale: Locale, slug: string) => getCatalog(locale).resources.find((item) => !item.draft && (item.id === slug || item.slug === slug || item.slug === `resources/${slug}`));
export const publicResources = (locale: Locale) => getCatalog(locale).resources.filter((item) => !item.draft);

export function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
