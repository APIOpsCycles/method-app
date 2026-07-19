import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage from "../../catalog-page";
import { PublicStationContent } from "../../public-content";
import { canonicalUrl, getStationBySlug, pageLanguageAlternates } from "../../public-method-data";
import routeIndex from "../../data/route-index.json";

export function generateStaticParams() {
  return routeIndex.translations.en.stations.map((station) => ({ station: station.id }));
}

export function generateMetadata({
  params,
}: {
  params: { station: string };
}): Metadata {
  const station = getStationBySlug(params.station, "en");
  return {
    title: station ? station.title : "APIOps Cycles Station",
    description: station?.description,
    alternates: station
      ? {
          canonical: `/stations/${station.id}`,
          languages: pageLanguageAlternates("station", station.id),
        }
      : undefined,
    openGraph: station
      ? {
          title: station.title,
          description: station.description,
          url: canonicalUrl("en", `/stations/${station.id}`),
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

export default function StationPage({
  params,
}: {
  params: { station: string };
}) {
  const station = getStationBySlug(params.station, "en");
  if (!station) notFound();
  return (
    <>
      <PublicStationContent station={station} locale="en" />
      <CatalogPage locale="en" initialStationId={params.station} />
    </>
  );
}
