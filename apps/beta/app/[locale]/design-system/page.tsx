import type { Metadata } from "next";
import DesignSystemPage from "../../design-system/design-system-page";
import { normalizeLocale } from "../../catalog-page";

export const metadata: Metadata = {
  title: "APIOps Design System",
  description:
    "Compact APIOps Design System guidance for APIOps Cycles foundations, visual language, canvas resources, UI components, and asset usage.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DesignSystemPage locale={normalizeLocale(locale)} />;
}

