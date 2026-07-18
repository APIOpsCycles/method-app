import type { Metadata } from "next";
import { PublicLicensingContent } from "../../public-content";
import { normalizeLocale } from "../../public-method-data";

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale = normalizeLocale(params.locale);
  return {
    title: "APIOps Cycles Licensing",
    description: "Attribution and licensing context for APIOps Cycles public method content.",
    alternates: { canonical: locale === "en" ? "/licensing" : `/${locale}/licensing` },
  };
}

export default function LocalizedLicensingPage() {
  return <PublicLicensingContent />;
}
