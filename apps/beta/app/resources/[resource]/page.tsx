import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage from "../../catalog-page";
import { PublicResourceContent } from "../../public-content";
import { canonicalUrl, getPublicResources, getResourceBySlug, pageLanguageAlternates } from "../../public-method-data";

export function generateStaticParams() {
  return getPublicResources("en").map((resource) => ({
    resource: resource.slug.replace(/^resources\//, ""),
  }));
}

export function generateMetadata({
  params,
}: {
  params: { resource: string };
}): Metadata {
  const resource = getResourceBySlug(params.resource, "en");
  return {
    title: resource ? resource.title : "APIOps Cycles Resource",
    description: resource?.description,
    alternates: resource
      ? {
          canonical: `/${resource.slug}`,
          languages: pageLanguageAlternates("resource", resource.id),
        }
      : undefined,
    openGraph: resource
      ? {
          title: resource.title,
          description: resource.description,
          url: canonicalUrl("en", `/${resource.slug}`),
          type: "article",
        }
      : undefined,
    robots: { index: Boolean(resource), follow: Boolean(resource) },
  };
}

export default function ResourcePage({
  params,
}: {
  params: { resource: string };
}) {
  const resource = getResourceBySlug(params.resource, "en");
  if (!resource) notFound();
  return (
    <>
      <PublicResourceContent resource={resource} locale="en" />
      <CatalogPage locale="en" />
    </>
  );
}
