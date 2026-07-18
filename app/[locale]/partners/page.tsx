import type { Metadata } from "next";
import { PublicPartnersContent } from "../../public-content";
import { normalizeLocale } from "../../public-method-data";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  return {
    title: "APIOps Cycles Partners",
    description: "Organizations supporting APIOps Cycles community adoption, training, method development, and implementation.",
    alternates: { canonical: locale === "en" ? "/partners" : `/${locale}/partners` },
  };
}

export default function LocalizedPartnersPage() {
  return <PublicPartnersContent />;
}
