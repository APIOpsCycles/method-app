import { type RefObject, useEffect, useRef, useState } from "react";
import { initializeMethodContext, setMethodContext, useMethodContext } from "../../lib/method-context";
import { resolveMethodContext } from "../../lib/resolve-method-context";
import { MetroLegend, MetroLinePath, MetroMapShell, MetroStationButton, MetroStationMarker, StakeholderRoleSelector } from "@apiops/design-system/react";
import { designSystemAssets } from "@apiops/design-system/assets";

export type MetroCycleStation = { id: string; index: number; title: string; baseTitle: string };
export type MetroCycle = { id: string; slug: string; title: string; stations: MetroCycleStation[] };
export type MetroLine = { id: string; title: string; color: string; stations: string[] };
export type MetroStation = { id: string; title: string; description: string };
export type MetroRole = { id: string; title: string; involvementByStation: Record<string, string> };

const colors: Record<string, string> = {
  "capability-productization-cycle": "var(--color-cycle-capability)",
  "api-productization-cycle": "var(--color-cycle-api)",
  "integration-productization-cycle": "var(--color-cycle-integration)",
  "automation-cycle": "var(--color-cycle-automation)",
};

type Cycle = MetroCycle;
type MetroLineData = MetroLine;
type Station = MetroStation;
function shortStationName(title: string) {
  return title.split(" - ")[0].split(" – ")[0].trim();
}

function wrapMapLabel(label: string, maxLength = 24) {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function metroMapSvgStyles(activeColor: string) {
  return `
    .metro-zone { opacity: 0.28; stroke: none; }
    .metro-zone--governance { fill: #a8d7ef; }
    .metro-zone--strategic { fill: #ffd75e; }
    .metro-zone--consumer { fill: #8ee6a4; }
    .metro-zone--technical { fill: #f6b16f; }
    .metro-zone-label,
    .metro-support-label,
    .metro-label,
    .metro-legend text,
    .metro-line-legend text { fill: #071640; font-family: Arial, sans-serif; font-size: 13px; font-weight: 800; }
    .metro-label { font-size: 10px; }
    .metro-support-label { font-size: 11px; font-weight: 650; }
    .metro-zone-title-bg { fill: #ffffff;  fill-opacity: 0.88; }
    .metro-route { fill: none; }
    .metro-support-node,
    .metro-node { fill: #ffffff; stroke: #ffffff; stroke-width: 3; }
    .metro-support-node { opacity: 0.9; stroke-width: 2; }
    .metro-station--highlighted .metro-node,
    .metro-station--highlighted .metro-support-node { stroke: ${activeColor}; }
    .metro-station--involvement-lead .metro-node,
    .metro-station--involvement-lead .metro-support-node { fill: #dcc6ee; stroke-width: 5; }
    .metro-station--involvement-core .metro-node,
    .metro-station--involvement-core .metro-support-node { fill: #ffffff; stroke-width: 4; }
    .metro-station--involvement-consulted .metro-node,
    .metro-station--involvement-consulted .metro-support-node { fill: #f3eef9; stroke-dasharray: 4 3; stroke-width: 3; }
    .metro-involvement-ring { fill: none; pointer-events: none; stroke: ${activeColor}; }
    .metro-involvement-ring--lead { stroke-width: 5; }
    .metro-involvement-ring--core { stroke-width: 3; }
    .metro-involvement-ring--consulted { stroke-dasharray: 5 4; stroke-width: 3; }
    .metro-selection-ring { fill: none; pointer-events: none; stroke: ${activeColor}; stroke-width: 4; }
    .metro-support-node--active,
    .metro-node--active { fill: ${activeColor}; stroke: ${activeColor}; }
    .metro-node-number { fill: #071640; font-family: Inter, sans-serif; font-size: 10px; font-weight: 900; pointer-events: none; }
    .metro-node-number--active { fill: #ffffff; }
    .metro-brand { opacity: 0.45; }
    .metro-core-label rect  { fill: #ffffff;  fill-opacity: 0.95; stroke: currentColor; }
    .metro-core-label text { fill: currentColor; font-family: Inter, sans-serif; font-size: 10px; font-weight: 850; pointer-events: none; }
    .metro-line-legend text { font-family: Inter, sans-serif; font-size: 10px; font-weight: 700; }
  `;
}

function resolveCssCustomProperties(value: string, styles: CSSStyleDeclaration): string {
  let resolved = value;
  for (let pass = 0; pass < 8 && resolved.includes("var("); pass += 1) {
    resolved = resolved.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/g, (_, name: string, fallback: string | undefined) => {
      const tokenValue = styles.getPropertyValue(name).trim();
      return tokenValue || fallback?.trim() || "";
    });
  }
  return resolved;
}

function inlineMetroMapExportColors(svg: SVGSVGElement, activeColor: string) {
  const rootStyles = getComputedStyle(document.documentElement);
  const resolvedActiveColor = resolveCssCustomProperties(activeColor, rootStyles);
  const colorAttributes = ["fill", "stroke", "color", "stop-color", "flood-color", "lighting-color"];

  for (const element of Array.from(svg.querySelectorAll<SVGElement>("*"))) {
    for (const attribute of colorAttributes) {
      const value = element.getAttribute(attribute);
      if (value?.includes("var(")) {
        element.setAttribute(attribute, resolveCssCustomProperties(value, rootStyles));
      }
    }

    const styleValue = element.getAttribute("style");
    if (styleValue?.includes("var(")) {
      element.setAttribute("style", resolveCssCustomProperties(styleValue, rootStyles));
    }
  }

  for (const label of Array.from(svg.querySelectorAll<SVGGElement>(".metro-core-label"))) {
    const rect = label.querySelector("rect");
    if (rect) {
      rect.setAttribute("fill", "rgba(255, 255, 255, 0.95)");
      rect.setAttribute("stroke", resolvedActiveColor);
      rect.setAttribute("stroke-width", "2");
    }
    for (const text of Array.from(label.querySelectorAll("text"))) {
      text.setAttribute("fill", resolvedActiveColor);
    }
    label.removeAttribute("style");
  }

  for (const ring of Array.from(svg.querySelectorAll<SVGElement>(".metro-involvement-ring, .metro-selection-ring"))) {
    ring.setAttribute("stroke", resolvedActiveColor);
  }

  return resolvedActiveColor;
}

function MetroMapView({
  cycles,
  lines,
  stations,
  selectedCycleId,
  selectedStationId,
  selectedLineId,
  stakeholderInvolvementByStation,
  goalStationIds,
  goalLineIds,
  recommendedStationId,
  onSelectCycle,
  onSelectStation,
  uiLabels,
  svgRef,
}: {
  cycles: Cycle[];
  lines: MetroLineData[];
  stations: Station[];
  selectedCycleId: string;
  selectedStationId: string;
  selectedLineId?: string;
  stakeholderInvolvementByStation: Record<string, string>;
  goalStationIds: string[];
  goalLineIds: string[];
  recommendedStationId?: string;
  onSelectCycle: (id: string) => void;
  onSelectStation: (id: string) => void;
  uiLabels: Record<string, string>;
  svgRef?: RefObject<SVGSVGElement | null>;
}) {
  const width = 1000;
  const height = 1000;
  const center = { x: 500, y: 500 };
  const coreRadius = 125;
  const coreLabelRadius = 190;
  const coreStations = cycles[0]?.stations ?? [];
  const selectedCycle = cycles.find((cycle) => cycle.id === selectedCycleId) ?? cycles[0];
  const stationById = new Map(stations.map((station) => [station.id, station]));
  const supportCoordinates: Record<string, { x: number; y: number; dx?: number; dy?: number; anchor?: "start" | "end" }> = {
    "ecosystem-vision": { x: 270, y: 160, dx: 16, dy: 0 },
    "competitive-analysis": { x: 270, y: 190, dx: 16, dy: 0 },
    "business-goals": { x: 270, y: 220, dx: 16, dy: 0 },
    "market-insights": { x: 270, y: 250, dx: 16, dy: 0 },
    "user-experience": { x: 270, y: 280, dx: 16, dy: 0 },
    "scalable-infrastructure": { x: 900, y: 560, dx: -16, dy: 0, anchor: "end" },
    "legal-and-compliance": { x: 900, y: 590, dx: -16, dy: 0, anchor: "end" },
    "security-and-privacy": { x: 900, y: 620, dx: -16, dy: 0, anchor: "end" },
    "design-standards": { x: 900, y: 650, dx: -16, dy: 0, anchor: "end" },
    "vendor-management": { x: 900, y: 680, dx: -16, dy: 0, anchor: "end" },
    "contract-design": { x: 500, y: 720, dx: 16, dy: 0 },
    development: { x: 500, y: 755, dx: 16, dy: 0 },
    "ci-cd": { x: 500, y: 790, dx: 16, dy: 0 },
    "test-automation": { x: 500, y: 825, dx: 16, dy: 0 },
    "release-management": { x: 500, y: 860, dx: 16, dy: 0 },
    "service-agreements": { x: 240, y: 450, dx: -16, dy: 0, anchor: "end" },
    "api-consumer-adoption": { x: 240, y: 420, dx: -16, dy: 0, anchor: "end" },
    "api-promotion": { x: 240, y: 390, dx: -16, dy: 0, anchor: "end" },
    "partner-integration": { x: 240, y: 360, dx: -16, dy: 0, anchor: "end" },
    "api-mindset": { x: 700, y: 300, dx: -16, dy: 0, anchor: "end" },
    "roles-and-responsibilities": { x: 700, y: 270, dx: -16, dy: 0, anchor: "end" },
    upskilling: { x: 700, y: 240, dx: -16, dy: 0, anchor: "end" },
    "operating-guidelines": { x: 700, y: 210, dx: -16, dy: 0, anchor: "end" },
    "portfolio-management": { x: 700, y: 180, dx: -16, dy: 0, anchor: "end" },
    "budget-and-resource-management": { x: 700, y: 150, dx: -16, dy: 0, anchor: "end" },
  };
  const labelBoxes = {
    strategic: { x: 455, y: 82, width: 108, height: 34, label: uiLabels["map.zoneStrategic"] },
    governance: { x: 705, y: 300, width: 124, height: 34, label: uiLabels["map.zoneGovernance"] },
    consumer: { x: 72, y: 488, width: 118, height: 34, label: uiLabels["map.zoneConsumer"] },
    technical: { x: 705, y: 706, width: 110, height: 34, label: uiLabels["map.zoneTechnical"] },
  };
  const coreLabelPositions: Record<number, { x: number; y: number }> = {
    1: { x: 500, y: 330 },
    2: { x: 690, y: 380 },
    3: { x: 730, y: 500 },
    4: { x: 650, y: 630 },
    5: { x: 500, y: 660 },
    6: { x: 350, y: 630 },
    7: { x: 270, y: 500 },
    8: { x: 330, y: 380 },
  };
  const lineLegend = [...lines].sort((a, b) => Number(goalLineIds.includes(b.id)) - Number(goalLineIds.includes(a.id))).map((line, index) => ({ ...line, x: 220, y: 700 + index * 28 }));
  const stationClassName = (id: string) => {
    const involvement = stakeholderInvolvementByStation[id];
    const goal = goalStationIds.includes(id);
    return [
      "metro-station",
      involvement ? "metro-station--highlighted" : "",
      involvement ? `metro-station--involvement-${involvement}` : "",
      involvement && goal ? "metro-station--context-strong" : involvement || goal ? "metro-station--context-medium" : "",
    ].filter(Boolean).join(" ");
  };
  const involvementFor = (id: string) => stakeholderInvolvementByStation[id];
  const corePoints = coreStations.map((station, index) => {
    const selectedCycleStation = selectedCycle?.stations.find((item) => item.id === station.id);
    const angle = -90 + (360 / coreStations.length) * index;
    const radians = (angle * Math.PI) / 180;
    const indexForLabel = selectedCycleStation?.index ?? station.index;
    const fixedLabel = coreLabelPositions[indexForLabel];
    return {
      ...station,
      displayTitle: selectedCycleStation?.title ?? station.baseTitle,
      angle,
      labelX: fixedLabel?.x ?? center.x + coreLabelRadius * Math.cos(radians),
      labelY: fixedLabel?.y ?? center.y + coreLabelRadius * Math.sin(radians),
      x: center.x + coreRadius * Math.cos(radians),
      y: center.y + coreRadius * Math.sin(radians),
    };
  });
  const corePointById = new Map(corePoints.map((point) => [point.id, point]));

  const linePoints = lines.map((line) => {
    const points = line.stations.map((stationId) => {
      const corePoint = corePointById.get(stationId);
      if (corePoint) {
        return { ...corePoint, support: false };
      }
      const fixedPoint = supportCoordinates[stationId] ?? { x: center.x, y: center.y };
      return {
        id: stationId,
        index: 0,
        title: shortStationName(stationById.get(stationId)?.title ?? stationId),
        baseTitle: shortStationName(stationById.get(stationId)?.title ?? stationId),
        description: stationById.get(stationId)?.description ?? "",
        resources: [],
        x: fixedPoint.x,
        y: fixedPoint.y,
        dx: fixedPoint.dx ?? 12,
        dy: fixedPoint.dy ?? 4,
        anchor: fixedPoint.anchor ?? "start",
        support: true,
      };
    });
    return { ...line, points };
  });

  const lineTrackOffsets: Record<string, number> = {
    "business-opportunities-line": -5,
    "platform-architecture-line": -4,
    "api-design-line": 4,
    "delivery-line": 6,
    "publishing-and-adoption-line": 5,
    "operating-model-line": 4,
  };

  const offsetTrackPoint = <T extends { x: number; y: number; support?: boolean }>(lineId: string, point: T): T => {
    if (point.support) return point;
    const amount = lineTrackOffsets[lineId] ?? 0;
    if (!amount) return point;
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      ...point,
      x: point.x + (dx / length) * amount,
      y: point.y + (dy / length) * amount,
    };
  };

  const linePathPoints = (line: (typeof linePoints)[number]) => {
    const byId = new Map(line.points.map((point) => [point.id, point]));
    const point = (id: string) => byId.get(id);
    const bend = (x: number, y: number) => ({ x, y });
    const routed = (() => {
      switch (line.id) {
      case "business-opportunities-line":
        return [
          point("monitoring-and-improving"),
          point("api-product-strategy"),
          bend(400, 300),
          point("user-experience"),
          point("market-insights"),
          point("business-goals"),
          point("competitive-analysis"),
          point("ecosystem-vision"),
        ].filter(Boolean);
      case "operating-model-line":
        return [
          point("api-product-strategy"),
          bend(610, 370),
          point("api-mindset"),
          point("roles-and-responsibilities"),
          point("upskilling"),
          point("operating-guidelines"),
          point("portfolio-management"),
          point("budget-and-resource-management"),
        ].filter(Boolean);
      case "platform-architecture-line":
        return [
          point("api-product-strategy"),
          point("api-consumer-experience"),
          point("api-platform-architecture"),
          bend(820, 500),
          point("scalable-infrastructure"),
          point("legal-and-compliance"),
          point("security-and-privacy"),
          point("design-standards"),
          point("vendor-management"),
        ].filter(Boolean);
      case "delivery-line":
        return [
          point("api-delivery"),
          point("contract-design"),
          point("development"),
          point("ci-cd"),
          point("test-automation"),
          point("release-management"),
        ].filter(Boolean);
      case "publishing-and-adoption-line":
        return [
          point("api-audit"),
          point("api-publishing"),
          point("monitoring-and-improving"),
          bend(240, 450),
          point("service-agreements"),
          point("api-consumer-adoption"),
          point("api-promotion"),
          point("partner-integration"),
        ].filter(Boolean);
      default:
        return line.points;
      }
    })();
    return routed.filter((point): point is NonNullable<typeof point> => Boolean(point)).map((point) => offsetTrackPoint(line.id, point));
  };

  const offsetFromCenter = (point: { x: number; y: number }, amount: number) => {
    if (!amount) return point;
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.sqrt(dx * dx + dy * dy) || 1;
    return {
      x: point.x + (dx / length) * amount,
      y: point.y + (dy / length) * amount,
    };
  };

  const paths = cycles.map((cycle) => {
    const cycleOffset = cycle.id === selectedCycleId ? 15 : 0;
    const points = cycle.stations
      .map((station) => corePoints.find((point) => point.id === station.id))
      .filter(Boolean)
      .map((point) => offsetFromCenter({ x: point?.x ?? 0, y: point?.y ?? 0 }, cycleOffset));
    return {
      id: cycle.id,
      title: cycle.title,
      color: colors[cycle.id] ?? "#164e63",
      points,
    };
  });

  return (
    <MetroMapShell svgRef={svgRef} width={width} height={height} label={uiLabels["map.ariaLabel"]}>
      <defs>
        <clipPath id="metro-map-circle-clip">
          <circle cx="500" cy="500" r="445" />
        </clipPath>
      </defs>
      <g clipPath="url(#metro-map-circle-clip)">
      <circle cx="500" cy="500" r="445" className="metro-zone metro-zone--governance" />
      <ellipse cx="390" cy="112" rx="205" ry="150" className="metro-zone metro-zone--strategic" />
      <ellipse cx="275" cy="430" rx="285" ry="112" className="metro-zone metro-zone--consumer" />
      <ellipse cx="605" cy="790" rx="345" ry="215" className="metro-zone metro-zone--technical" />
      {Object.entries(labelBoxes).map(([id, box]) => (
        <g key={id}>
          <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="6" className="metro-zone-title-bg" />
          <text x={box.x + box.width / 2} y={box.y + 22} textAnchor="middle" className="metro-zone-label">
            {box.label}
          </text>
        </g>
      ))}
      {linePoints.map((line) => (
        <g key={line.id}>
          <MetroLinePath id={line.id} points={linePathPoints(line)} color={line.color} strokeWidth={selectedLineId === line.id ? 10 : 5} opacity={selectedLineId && selectedLineId !== line.id ? 0.18 : 0.82} className="metro-line-path" />
          {line.points.filter((point) => point.support).map((point) => (
            <MetroStationButton key={`${line.id}-${point.id}`} id={point.id} label={`${point.baseTitle}${point.id === recommendedStationId ? ` — ${uiLabels["map.modeTitle.start"]}` : ""}`} x={point.x} y={point.y} selected={point.id === selectedStationId} className={stationClassName(point.id)} onSelect={onSelectStation}>
              {involvementFor(point.id) ? (
                <circle cx={point.x} cy={point.y} r="10" className={`metro-involvement-ring metro-involvement-ring--${involvementFor(point.id)}`} />
              ) : null}
              {point.id === recommendedStationId && point.id !== selectedStationId ? <circle cx={point.x} cy={point.y} r="14" className="metro-recommended-ring" /> : null}
              <MetroStationMarker x={point.x} y={point.y} radius={6} label={point.baseTitle} labelX={point.x + (point.dx ?? 0)} labelY={point.y + (point.dy ?? 0)} textAnchor={point.anchor} />
            </MetroStationButton>
          ))}
        </g>
      ))}
      {paths.map((path) => (
        <MetroLinePath key={path.id} id={path.id} points={path.points} color={path.color} selected={path.id === selectedCycleId} onSelect={onSelectCycle} closed />
      ))}
      {corePoints.map((point) => (
        <MetroStationButton key={point.id} id={point.id} label={`${point.baseTitle}${point.id === recommendedStationId ? ` — ${uiLabels["map.modeTitle.start"]}` : ""}`} x={point.x} y={point.y} selected={point.id === selectedStationId} selectionRadius={25} className={stationClassName(point.id)} onSelect={onSelectStation}>
          {involvementFor(point.id) ? (
            <circle cx={point.x} cy={point.y} r="20" className={`metro-involvement-ring metro-involvement-ring--${involvementFor(point.id)}`} />
          ) : null}
          {point.id === recommendedStationId && point.id !== selectedStationId ? <circle cx={point.x} cy={point.y} r="25" className="metro-recommended-ring" /> : null}
          <MetroStationMarker x={point.x} y={point.y} radius={14} number={point.index} nodeClassName="metro-node" />
          {(() => {
            const lines = wrapMapLabel(point.displayTitle);
            const boxWidth = Math.max(128, Math.max(...lines.map((line) => line.length)) * 7 + 20);
            const boxHeight = lines.length * 12 + 14;
            const boxX = point.labelX - boxWidth / 2;
            const boxY = point.labelY - boxHeight / 2;
            return (
              <g className="metro-core-label" style={{ color: colors[selectedCycleId] ?? "#164e63" }}>
                <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} rx="8" />
                {lines.map((line, lineIndex) => (
                  <text key={line} x={point.labelX} y={boxY + 18 + lineIndex * 14} textAnchor="middle">
                    {line}
                  </text>
                ))}
              </g>
            );
          })()}
        </MetroStationButton>
      ))}
      <image
        href={designSystemAssets.brand.cyclesLogoDark}
        x={center.x - 30}
        y={center.y - 30}
        width="60"
        height="60"
        className="metro-brand"
      />
      <MetroLegend items={lineLegend.map((line) => ({ id: line.id, label: line.title, color: line.color }))} x={220} y={700} />
      </g>
    </MetroMapShell>
  );
}

export default function MetroMapIsland({ locale, labels, cycles, lines, stations, roles, goals, initialCycleId, initialStationId, initialRoleId, initialLineId }: { locale: string; labels: Record<string, string>; cycles: MetroCycle[]; lines: MetroLine[]; stations: MetroStation[]; roles: MetroRole[]; goals: Array<{ id: string; label: string; description: string; stationIds: string[]; lineIds: string[] }>; initialCycleId?: string; initialStationId?: string; initialRoleId?: string; initialLineId?: string }) {
  const [cycleId, setCycleId] = useState(initialCycleId ?? cycles[0]?.id ?? "");
  const [stationId, setStationId] = useState(initialStationId ?? cycles[0]?.stations[0]?.id ?? stations[0]?.id ?? "");
  const context = useMethodContext();
  const effectiveRoleId = context.stakeholderId ?? initialRoleId ?? "";
  const resolved = resolveMethodContext({ stakeholderId: effectiveRoleId || undefined, goalId: context.goalId, preferredCycleId: initialCycleId, currentStationId: initialStationId });
  useEffect(() => { initializeMethodContext(); }, []);
  useEffect(() => { if (!initialCycleId && resolved.recommendedCycleId) setCycleId(resolved.recommendedCycleId); }, [initialCycleId, resolved.recommendedCycleId]);
  const svgRef = useRef<SVGSVGElement>(null);
  async function inlineLogoForExport(clone: SVGSVGElement) {
    for (const image of Array.from(clone.querySelectorAll("image"))) {
      const href = image.getAttribute("href");
      if (href === designSystemAssets.brand.cyclesLogoDark) {
        const response = await fetch(href);
        const logoText = await response.text();
        const logo = new DOMParser().parseFromString(logoText, "image/svg+xml").documentElement;
        const inlineLogo = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        inlineLogo.setAttribute("x", image.getAttribute("x") ?? "0");
        inlineLogo.setAttribute("y", image.getAttribute("y") ?? "0");
        inlineLogo.setAttribute("width", image.getAttribute("width") ?? "60");
        inlineLogo.setAttribute("height", image.getAttribute("height") ?? "60");
        inlineLogo.setAttribute("viewBox", logo.getAttribute("viewBox") ?? "0 0 567 567");
        inlineLogo.setAttribute("preserveAspectRatio", logo.getAttribute("preserveAspectRatio") ?? "xMidYMid meet");
        inlineLogo.setAttribute("class", image.getAttribute("class") ?? "");
        Array.from(logo.children).filter((child) => child.localName !== "namedview").forEach((child) => {
          const importedChild = document.importNode(child, true);
          (importedChild as Element).removeAttribute("xmlns:sodipodi");
          (importedChild as Element).removeAttribute("sodipodi:nodetypes");
          inlineLogo.appendChild(importedChild);
        });
        image.replaceWith(inlineLogo);
      } else if (href?.startsWith("/")) {
        image.setAttribute("href", `${window.location.origin}${href}`);
      }
    }
  }

  async function exportSvg() {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    await inlineLogoForExport(clone);
    inlineMetroMapExportColors(clone, colors[cycleId] ?? "#164e63");
    // Remove sodipodi attributes from all elements
    Array.from(clone.querySelectorAll("*")).forEach((element) => {
      Array.from(element.attributes).forEach((attr) => {
        if (attr.name.startsWith("xmlns:sodipodi") || attr.name.startsWith("sodipodi:")) {
          element.removeAttribute(attr.name);
        }
      });
    });
    clone.insertAdjacentHTML("afterbegin", `<style>${metroMapSvgStyles(colors[cycleId] ?? "#164e63")}</style>`);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
    const link = document.createElement("a"); link.href = url; link.download = `apiops-metro-${locale}.svg`; link.click(); URL.revokeObjectURL(url);
  }
  const prefix = locale === "en" ? "" : `/${locale}`;
  const navigate = (path: string) => window.location.assign(`${prefix}${path}`);
  return <section className="island-panel" aria-labelledby="metro-map-title">
    <header className="island-heading"><div><p className="public-kicker">{labels["map.methodKicker"]}</p><h2 id="metro-map-title">{labels["map.title"]}</h2></div><button className="is-button" type="button" onClick={exportSvg}>{labels["map.exportSvg"]}</button></header>
    <p>{labels["map.help"]}</p>
    <nav className="cycle-context-navigation" aria-label={labels["map.cycleNavigation"]}>
      <span className="cycle-context-navigation__current">{labels["map.viewingCycle"]}: <strong>{cycles.find((cycle) => cycle.id === cycleId)?.title}</strong></span>
      <span className="cycle-context-navigation__others">{labels["map.otherCycles"]}: {cycles.filter((cycle) => cycle.id !== cycleId).map((cycle, index) => <span key={cycle.id}>{index > 0 && <b aria-hidden="true"> · </b>}<button type="button" onClick={() => navigate(`/cycles/${cycle.slug}`)}>{cycle.title}</button></span>)}</span>
    </nav>
    <div className="metro-map-context">
      <StakeholderRoleSelector roles={roles} value={effectiveRoleId} label={labels["controls.selectStakeholder"]} placeholder={labels["context.notSelected"]} involvementLabels={{ lead: labels["involvement.lead"], core: labels["involvement.core"], consulted: labels["involvement.consulted"] }} disabled={Boolean(effectiveRoleId)} onChange={(stakeholderId) => setMethodContext({ stakeholderId: stakeholderId || undefined })} />
    </div>
    <MetroMapView cycles={cycles} lines={lines} stations={stations} selectedCycleId={cycleId} selectedStationId={stationId} selectedLineId={initialLineId} stakeholderInvolvementByStation={roles.find((role) => role.id === effectiveRoleId)?.involvementByStation ?? {}} goalStationIds={goals.find((goal) => goal.id === context.goalId)?.stationIds ?? []} goalLineIds={goals.find((goal) => goal.id === context.goalId)?.lineIds ?? []} recommendedStationId={resolved.recommendedEntryStationId} onSelectCycle={(id) => { setCycleId(id); const selected = cycles.find((cycle) => cycle.id === id); if (selected) navigate(`/cycles/${selected.slug}`); }} onSelectStation={(id) => { setStationId(id); const selectedCycle = cycles.find((cycle) => cycle.id === cycleId); const isCycleStation = selectedCycle?.stations.some((station) => station.id === id); navigate(isCycleStation && selectedCycle ? `/cycles/${selectedCycle.slug}/stations/${id}` : `/stations/${id}`); }} uiLabels={labels} svgRef={svgRef} />
  </section>;
}
