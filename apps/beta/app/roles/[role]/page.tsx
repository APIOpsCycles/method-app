import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage from "../../catalog-page";
import { canonicalUrl, getStakeholderBySlug, pageLanguageAlternates } from "../../public-method-data";
import routeIndex from "generated-data/route-index.json";

export function generateStaticParams() {
  return routeIndex.translations.en.routeProfiles.map((role) => ({ role: role.id }));
}

export function generateMetadata({
  params,
}: {
  params: { role: string };
}): Metadata {
  const role = getStakeholderBySlug(params.role, "en");
  return {
    title: role ? `${role.title} Guide` : "Stakeholder Guide",
    description: role?.summary,
    alternates: role
      ? {
          canonical: `/roles/${role.id}`,
          languages: pageLanguageAlternates("role", role.id),
        }
      : undefined,
    openGraph: role
      ? {
          title: `${role.title} Guide`,
          description: role.summary,
          url: canonicalUrl("en", `/roles/${role.id}`),
          type: "article",
        }
      : undefined,
    twitter: role
      ? {
          card: "summary",
          title: `${role.title} Guide`,
          description: role.summary,
        }
      : undefined,
    robots: { index: Boolean(role), follow: Boolean(role) },
  };
}

export default function RolePage({
  params,
}: {
  params: { role: string };
}) {
  const role = getStakeholderBySlug(params.role, "en");
  if (!role) notFound();
  return (
    <>
      <CatalogPage locale="en" initialRoleId={params.role} />
    </>
  );
}
