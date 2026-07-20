import DataPage from "../../data/data-page";
export default function Page({ params }: { params: { locale: string } }) { return <DataPage locale={params.locale} />; }
