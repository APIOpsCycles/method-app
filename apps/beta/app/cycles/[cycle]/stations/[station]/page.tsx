import { notFound } from "next/navigation";
import CatalogPage from "../../../../catalog-page";
import { getCycleBySlug } from "../../../../public-method-data";
export default function Page({ params }: { params: { cycle: string; station: string } }) { const cycle = getCycleBySlug(params.cycle, "en"); if (!cycle?.stations.some((station) => station.id === params.station)) notFound(); return <CatalogPage locale="en" initialCycleId={cycle.id} initialStationId={params.station} />; }
