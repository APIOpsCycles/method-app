import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage, { normalizeLocale } from "../../../catalog-page";
import { PublicStationContent } from "../../../public-content";
import { canonicalUrl, getCycleBySlug, getStationBySlug } from "../../../public-method-data";
import routeIndex from "../../../data/route-index.json";

const apiProductizationCycleId = "api-productization-cycle";

export function generateStaticParams() {
  return routeIndex.locales.flatMap((locale) => {
    const cycle = routeIndex.translations[locale].cycles.find((item) => item.id === apiProductizationCycleId);
    return (cycle?.stations ?? []).map((station) => ({ locale, station: station.id }));
  });
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; station: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  const cycle = getCycleBySlug(apiProductizationCycleId, locale);
  const station = cycle?.stations.find((item) => item.id === params.station) ?? getStationBySlug(params.station, locale);
  return {
    title: station ? `${station.title} | ${cycle?.title ?? "APIOps Cycles"}` : "APIOps Cycles Method",
    description: station?.description ?? cycle?.description,
    alternates: station
      ? { canonical: locale === "en" ? `/method/${station.id}` : `/${locale}/method/${station.id}` }
      : undefined,
    openGraph: station
      ? {
          title: station.title,
          description: station.description,
          url: canonicalUrl(locale, `/method/${station.id}`),
          type: "article",
        }
      : undefined,
    robots: { index: Boolean(station), follow: Boolean(station) },
  };
}

export default function LocalizedMethodStationPage({
  params,
}: {
  params: { locale: string; station: string };
}) {
  const cycle = getCycleBySlug(apiProductizationCycleId, params.locale);
  const station = cycle?.stations.find((item) => item.id === params.station) ?? getStationBySlug(params.station, params.locale);
  if (!station) notFound();
  return (
    <>
      <PublicStationContent station={station} locale={params.locale} />
      <CatalogPage locale={params.locale} initialCycleId={apiProductizationCycleId} initialStationId={params.station} />
    </>
  );
}
