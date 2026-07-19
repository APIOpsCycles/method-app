import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage, { normalizeLocale } from "../../../catalog-page";
import { canonicalUrl, getCycleBySlug, pageLanguageAlternates } from "../../../public-method-data";
import routeIndex from "../../../data/route-index.json";

export function generateStaticParams() {
  return routeIndex.locales.flatMap((locale) =>
    routeIndex.translations[locale].cycles.map((cycle) => ({ locale, cycle: cycle.slug })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; cycle: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  const cycle = getCycleBySlug(params.cycle, locale);
  return {
    title: cycle ? cycle.title : "APIOps Cycles",
    description: cycle?.description,
    alternates: cycle
      ? {
          canonical: locale === "en" ? `/cycles/${cycle.slug}` : `/${locale}/cycles/${cycle.slug}`,
          languages: pageLanguageAlternates("cycle", cycle.id),
        }
      : undefined,
    openGraph: cycle
      ? {
          title: cycle.title,
          description: cycle.description,
          url: canonicalUrl(locale, `/cycles/${cycle.slug}`),
          type: "article",
        }
      : undefined,
    twitter: cycle
      ? {
          card: "summary",
          title: cycle.title,
          description: cycle.description,
        }
      : undefined,
    robots: { index: Boolean(cycle), follow: Boolean(cycle) },
  };
}

export default function LocalizedCyclePage({
  params,
}: {
  params: { locale: string; cycle: string };
}) {
  const cycle = getCycleBySlug(params.cycle, params.locale);
  if (!cycle) notFound();
  return (
    <>
      <CatalogPage locale={params.locale} initialCycleId={params.cycle} />
    </>
  );
}
