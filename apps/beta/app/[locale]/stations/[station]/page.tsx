import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage, { normalizeLocale } from "../../../catalog-page";
import { canonicalUrl, getStationBySlug, pageLanguageAlternates } from "../../../public-method-data";
import routeIndex from "../../../data/route-index.json";

export function generateStaticParams() {
  return routeIndex.locales.flatMap((locale) =>
    routeIndex.translations[locale].stations.map((station) => ({ locale, station: station.id })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; station: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  const station = getStationBySlug(params.station, locale);
  return {
    title: station ? station.title : "APIOps Cycles Station",
    description: station?.description,
    alternates: station
      ? {
          canonical: locale === "en" ? `/stations/${station.id}` : `/${locale}/stations/${station.id}`,
          languages: pageLanguageAlternates("station", station.id),
        }
      : undefined,
    openGraph: station
      ? {
          title: station.title,
          description: station.description,
          url: canonicalUrl(locale, `/stations/${station.id}`),
          type: "article",
        }
      : undefined,
    twitter: station
      ? {
          card: "summary",
          title: station.title,
          description: station.description,
        }
      : undefined,
    robots: { index: Boolean(station), follow: Boolean(station) },
  };
}

export default function LocalizedStationPage({
  params,
}: {
  params: { locale: string; station: string };
}) {
  const station = getStationBySlug(params.station, params.locale);
  if (!station) notFound();
  return (
    <>
      <CatalogPage locale={params.locale} initialStationId={params.station} />
    </>
  );
}
