import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogPage, { normalizeLocale } from "../../../catalog-page";
import { PublicRoleContent } from "../../../public-content";
import { canonicalUrl, getStakeholderBySlug } from "../../../public-method-data";
import routeIndex from "../../../data/route-index.json";

export function generateStaticParams() {
  return routeIndex.locales.flatMap((locale) =>
    routeIndex.translations[locale].routeProfiles.map((role) => ({ locale, role: role.id })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; role: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  const role = getStakeholderBySlug(params.role, locale);
  return {
    title: role ? `${role.title} Guide` : "Stakeholder Guide",
    description: role?.summary,
    alternates: role
      ? { canonical: locale === "en" ? `/roles/${role.id}` : `/${locale}/roles/${role.id}` }
      : undefined,
    openGraph: role
      ? {
          title: `${role.title} Guide`,
          description: role.summary,
          url: canonicalUrl(locale, `/roles/${role.id}`),
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

export default function LocalizedRolePage({
  params,
}: {
  params: { locale: string; role: string };
}) {
  const role = getStakeholderBySlug(params.role, params.locale);
  if (!role) notFound();
  return (
    <>
      <PublicRoleContent role={role} locale={params.locale} />
      <CatalogPage locale={params.locale} initialRoleId={params.role} />
    </>
  );
}
