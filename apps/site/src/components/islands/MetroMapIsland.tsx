import { useRef, useState } from "react";

export type MetroStation = { id: string; title: string; x: number; y: number };
export type MetroLine = { id: string; title: string; color: string; stationIds: string[] };

interface Props {
  locale: string;
  stations: MetroStation[];
  lines: MetroLine[];
  initialStationId?: string;
}

export default function MetroMapIsland({ locale, stations, lines, initialStationId }: Props) {
  const [selectedId, setSelectedId] = useState(initialStationId ?? stations[0]?.id ?? "");
  const svgRef = useRef<SVGSVGElement>(null);
  const byId = new Map(stations.map((station) => [station.id, station]));
  const selected = byId.get(selectedId);

  function exportSvg() {
    if (!svgRef.current) return;
    const source = new XMLSerializer().serializeToString(svgRef.current);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `apiops-metro-${locale}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <section className="island-panel" aria-labelledby="metro-map-title">
    <header className="island-heading"><div><p className="public-kicker">Method map</p><h2 id="metro-map-title">Metro map</h2></div><button type="button" onClick={exportSvg}>Export SVG</button></header>
    <p>Select a station to inspect its place in the method. The complete map remains visible before this tool becomes interactive.</p>
    <svg ref={svgRef} viewBox="0 0 800 520" role="img" aria-label="APIOps Cycles metro map" className="island-metro">
      <rect width="800" height="520" rx="24" fill="#f8fbff" />
      {lines.map((line, index) => {
        const points = line.stationIds.map((id) => byId.get(id)).filter((item): item is MetroStation => Boolean(item));
        return <g key={line.id}><polyline points={points.map((point) => `${point.x},${point.y + index * 3}`).join(" ")} fill="none" stroke={line.color} strokeWidth="6" /><title>{line.title}</title></g>;
      })}
      {stations.map((station) => <g key={station.id} className="metro-button" role="button" tabIndex={0} aria-label={`Select ${station.title}`} onClick={() => setSelectedId(station.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(station.id); }}>
        <circle cx={station.x} cy={station.y} r={selectedId === station.id ? 13 : 9} fill={selectedId === station.id ? "#071640" : "white"} stroke="#071640" strokeWidth="3" />
        <text x={station.x} y={station.y + 25} textAnchor="middle">{station.title}</text>
      </g>)}
    </svg>
    <p className="island-selection" aria-live="polite">Selected station: <strong>{selected?.title ?? "None"}</strong></p>
  </section>;
}
