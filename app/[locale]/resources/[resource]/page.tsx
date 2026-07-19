import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage, { normalizeLocale } from "../../../catalog-page";
import { PublicResourceContent } from "../../../public-content";
import { canonicalUrl, getPublicResources, getResourceBySlug, pageLanguageAlternates } from "../../../public-method-data";
import routeIndex from "../../../data/route-index.json";

export function generateStaticParams() {
  return routeIndex.locales.flatMap((locale) =>
    getPublicResources(locale).map((resource) => ({
      locale,
      resource: resource.slug.replace(/^resources\//, ""),
    })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; resource: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  const resource = getResourceBySlug(params.resource, locale);
  return {
    title: resource ? resource.title : "APIOps Cycles Resource",
    description: resource?.description,
    alternates: resource
      ? {
          canonical: locale === "en" ? `/${resource.slug}` : `/${locale}/${resource.slug}`,
          languages: pageLanguageAlternates("resource", resource.id),
        }
      : undefined,
    openGraph: resource
      ? {
          title: resource.title,
          description: resource.description,
          url: canonicalUrl(locale, `/${resource.slug}`),
          type: "article",
        }
      : undefined,
    robots: { index: Boolean(resource), follow: Boolean(resource) },
  };
}

export default function LocalizedResourcePage({
  params,
}: {
  params: { locale: string; resource: string };
}) {
  const resource = getResourceBySlug(params.resource, params.locale);
  if (!resource) notFound();
  return (
    <>
      <PublicResourceContent resource={resource} locale={params.locale} />
      <CatalogPage locale={params.locale} />
    </>
  );
}
