import routeIndex from "../../../../generated/method/route-index.json";
import labelsEn from "../../../../generated/method/site-labels.en.json";
import labelsFi from "../../../../generated/method/site-labels.fi.json";
import labelsFr from "../../../../generated/method/site-labels.fr.json";
import labelsDe from "../../../../generated/method/site-labels.de.json";
import labelsPt from "../../../../generated/method/site-labels.pt.json";
import catalogEn from "../../../../generated/method/method-catalog.en.json";
import catalogFi from "../../../../generated/method/method-catalog.fi.json";
import catalogFr from "../../../../generated/method/method-catalog.fr.json";
import catalogDe from "../../../../generated/method/method-catalog.de.json";
import catalogPt from "../../../../generated/method/method-catalog.pt.json";

const labelCatalogs = { en: labelsEn, fi: labelsFi, fr: labelsFr, de: labelsDe, pt: labelsPt } as const;
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
export type Labels = typeof labelsEn.translations.en;
/** Fallback rule: a missing locale key uses the generated English value; translated values are never guessed at runtime. */
export const getLabels = (locale: Locale = defaultLocale): Labels => ({
  ...labelCatalogs.en.translations.en,
  ...labelCatalogs[locale].translations[locale],
});
export type LabelSubset<K extends keyof Labels> = Pick<Labels, K>;
export const pickLabels = <K extends keyof Labels>(labels: Labels, keys: readonly K[]): LabelSubset<K> =>
  Object.fromEntries(keys.map((key) => [key, labels[key]])) as LabelSubset<K>;
export const getCycle = (locale: Locale, slug: string) => getCatalog(locale).cycles.find((item) => item.slug === slug || item.id === slug);
export const getStation = (locale: Locale, slug: string) => getCatalog(locale).stations.find((item) => item.id === slug || item.slug === slug || item.slug === `method/${slug}`);
export const getRole = (locale: Locale, slug: string) => getCatalog(locale).routeProfiles.find((item) => item.id === slug || item.stakeholderId === slug);
export const getResource = (locale: Locale, slug: string) => getCatalog(locale).resources.find((item) => !item.draft && (item.id === slug || item.slug === slug || item.slug === `resources/${slug}`));
export const publicResources = (locale: Locale) => getCatalog(locale).resources.filter((item) => !item.draft);
export const resourceRouteSegment = (resource: Resource) => resource.slug.replace(/^resources\//, "");

export function getStationResources(locale: Locale, station: Station) {
  const catalog = getCatalog(locale);
  const resourceIds = new Set([
    ...((station.resources ?? []).map((resource) => resource.id)),
    ...station.steps.map((step) => step.resourceId).filter((id): id is string => Boolean(id)),
  ]);
  return catalog.resources.filter((resource) => resourceIds.has(resource.id) && !resource.draft);
}

export function uniqueById<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
