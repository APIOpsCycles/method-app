import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage from "../../catalog-page";
import { canonicalUrl, getCycleBySlug, pageLanguageAlternates } from "../../public-method-data";
import routeIndex from "generated-data/route-index.json";

export function generateStaticParams() {
  return routeIndex.translations.en.cycles.map((cycle) => ({ cycle: cycle.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { cycle: string };
}): Metadata {
  const cycle = getCycleBySlug(params.cycle, "en");
  return {
    title: cycle ? cycle.title : "APIOps Cycles",
    description: cycle?.description,
    alternates: cycle ? {
      canonical: `/cycles/${cycle.slug}`,
      languages: pageLanguageAlternates("cycle", cycle.id),
    } : undefined,
    openGraph: cycle ? {
      title: cycle.title,
      description: cycle.description,
      url: canonicalUrl("en", `/cycles/${cycle.slug}`),
      type: "article",
    } : undefined,
    twitter: cycle ? {
      card: "summary",
      title: cycle.title,
      description: cycle.description,
    } : undefined,
    robots: { index: Boolean(cycle), follow: Boolean(cycle) },
  };
}

export default function CyclePage({
  params,
}: {
  params: { cycle: string };
}) {
  const cycle = getCycleBySlug(params.cycle, "en");
  if (!cycle) notFound();
  return (
    <>
      <CatalogPage locale="en" initialCycleId={params.cycle} />
    </>
  );
}
