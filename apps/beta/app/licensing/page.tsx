import type { Metadata } from "next";
import { PublicLicensingContent } from "../public-content";

export const metadata: Metadata = {
  title: "APIOps Cycles Licensing",
  description: "Attribution and licensing context for APIOps Cycles public method content.",
  alternates: { canonical: "/licensing" },
};

export default function LicensingPage() {
  return <PublicLicensingContent />;
}
