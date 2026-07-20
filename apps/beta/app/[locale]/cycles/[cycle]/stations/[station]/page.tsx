import { notFound } from "next/navigation";
import CatalogPage from "../../../../../catalog-page";
import { getCycleBySlug } from "../../../../../public-method-data";
export default function Page({ params }: { params: { locale: string; cycle: string; station: string } }) { const cycle = getCycleBySlug(params.cycle, params.locale); if (!cycle?.stations.some((station) => station.id === params.station)) notFound(); return <CatalogPage locale={params.locale} initialCycleId={cycle.id} initialStationId={params.station} />; }
