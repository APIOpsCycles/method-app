import type { Metadata } from "next";
import DataPage from "./data-page";
export const metadata: Metadata = { title: "APIOps Cycles static data", alternates: { canonical: "/data" } };
export default function Page() { return <DataPage />; }
