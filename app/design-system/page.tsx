import type { Metadata } from "next";
import DesignSystemPage from "./design-system-page";

export const metadata: Metadata = {
  title: "APIOps Design System",
  description:
    "Compact APIOps Design System guidance for APIOps Cycles foundations, visual language, canvas resources, UI components, and asset usage.",
  alternates: {
    canonical: "/design-system",
  },
};

export default function Page() {
  return <DesignSystemPage locale="en" />;
}

