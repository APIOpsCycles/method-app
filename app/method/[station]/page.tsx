import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage from "../../catalog-page";
import { PublicStationContent } from "../../public-content";
import { canonicalUrl, getCycleBySlug, getStationBySlug } from "../../public-method-data";
import routeIndex from "../../data/route-index.json";

const apiProductizationCycleId = "api-productization-cycle";

export function generateStaticParams() {
  const cycle = routeIndex.translations.en.cycles.find((item) => item.id === apiProductizationCycleId);
  return (cycle?.stations ?? []).map((station) => ({ station: station.id }));
}

export function generateMetadata({
  params,
}: {
  params: { station: string };
}): Metadata {
  const cycle = getCycleBySlug(apiProductizationCycleId, "en");
  const station = cycle?.stations.find((item) => item.id === params.station) ?? getStationBySlug(params.station, "en");
  return {
    title: station ? `${station.title} | ${cycle?.title ?? "APIOps Cycles"}` : "APIOps Cycles Method",
    description: station?.description ?? cycle?.description,
    alternates: station ? { canonical: `/method/${station.id}` } : undefined,
    openGraph: station
      ? {
          title: station.title,
          description: station.description,
          url: canonicalUrl("en", `/method/${station.id}`),
          type: "article",
        }
      : undefined,
    robots: { index: Boolean(station), follow: Boolean(station) },
  };
}

export default function MethodStationPage({
  params,
}: {
  params: { station: string };
}) {
  const cycle = getCycleBySlug(apiProductizationCycleId, "en");
  const station = cycle?.stations.find((item) => item.id === params.station) ?? getStationBySlug(params.station, "en");
  if (!station) notFound();
  return (
    <>
      <PublicStationContent station={station} locale="en" />
      <CatalogPage locale="en" initialCycleId={apiProductizationCycleId} initialStationId={params.station} />
    </>
  );
}
