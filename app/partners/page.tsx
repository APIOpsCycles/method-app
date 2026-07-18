import type { Metadata } from "next";
import { PublicPartnersContent } from "../public-content";

export const metadata: Metadata = {
  title: "APIOps Cycles Partners",
  description: "Organizations supporting APIOps Cycles community adoption, training, method development, and implementation.",
  alternates: { canonical: "/partners" },
};

export default function PartnersPage() {
  return <PublicPartnersContent />;
}
