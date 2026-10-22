import { canonicalUrl } from "../env";
import { defaultLocale, getCatalog, getStationResources, localePrefix, publicResources, resourcePath, type Cycle, type Locale, type Station } from "./method-data";
import canvasEn from "../../../../generated/method/canvas-manifest.en.json";
import canvasFi from "../../../../generated/method/canvas-manifest.fi.json";
import canvasFr from "../../../../generated/method/canvas-manifest.fr.json";
import canvasDe from "../../../../generated/method/canvas-manifest.de.json";
import canvasPt from "../../../../generated/method/canvas-manifest.pt.json";

const manifests = { en: canvasEn, fi: canvasFi, fr: canvasFr, de: canvasDe, pt: canvasPt };
export type MethodDocument = { path: string; canonicalPath: string; title: string; content: string };
const documentCache = new Map<Locale, MethodDocument[]>();
const text = (value: string) => value.replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\s+/g, " ").trim();
const link = (title: string, path: string) => `[${text(title)}](${canonicalUrl(path)})`;
export const markdownPath = (path: string) => path.endsWith("/") ? `${path}index.md` : `${path}.md`;
export const fullMarkdownPath = (locale: Locale) => `${localePrefix(locale)}/llms-full.txt`;
const section = (title: string, items: string[]) => items.length ? `## ${title}\n\n${items.join("\n")}\n\n` : "";
const bullets = (items: string[]) => items.map((item) => `- ${text(item)}`);
const criteria = (items: { id: string; title: string; description: string }[]) => items.map((item) =>
  `- ${text(item.title)}${item.description && item.description !== item.title ? ` — ${text(item.description)}` : ""} (ID: ${text(item.id)})`);

/** One source for individual Markdown documents and the full, per-language export. */
export function methodDocuments(locale: Locale = defaultLocale): MethodDocument[] {
  const cached = documentCache.get(locale);
  if (cached) return cached;
  const catalog = getCatalog(locale);
  const prefix = localePrefix(locale);
  const resources = publicResources(locale);
  const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
  const documents: MethodDocument[] = [];
  const add = (path: string, title: string, body: string, id?: string) => documents.push({
    path: markdownPath(path), canonicalPath: path, title,
    content: `# ${text(title)}\n\nCanonical page: ${canonicalUrl(path)}\n\nLanguage: ${locale}${id ? `\n\nEntity ID: ${text(id)}` : ""}\n\n${body.trim()}\n`,
  });
  const resourceLinks = (ids: string[]) => [...new Set(ids)].flatMap((id) => {
    const resource = resourceById.get(id);
    return resource ? [`- ${link(resource.title, markdownPath(resourcePath(locale, resource)))}`] : [];
  });
  const stationLinks = (stations: Station[], cycle?: Cycle) => stations.map((station) =>
    `- ${link(station.title, markdownPath(cycle ? `${prefix}/cycles/${cycle.slug}/stations/${station.id}` : `${prefix}/stations/${station.id}`))}`);
  const stationBody = (station: Station, baseline?: Station) => {
    // Context pages carry only changed fields; shared guidance is fetched once.
    const changed = (key: keyof Station) => !baseline || JSON.stringify(station[key]) !== JSON.stringify(baseline[key]);
    const stationSection = (title: string, items: string[]) => section(title, items.length ? items : baseline ? ["No items specified for this cycle; replaces the shared section."] : []);
    let body = "";
    const fieldLabels = { description: "Description", whyItMatters: "Why it matters", applyInWork: "Apply in work" };
    for (const key of ["description", "whyItMatters", "applyInWork"] as const) {
      if (changed(key)) body += section(fieldLabels[key], [station[key] ? text(station[key]) : "No additional guidance specified."]);
    }
    if (changed("outcomes")) body += stationSection("Outcomes", bullets(station.outcomes));
    if (changed("steps")) body += stationSection("Steps", station.steps.map((step, index) => {
      const resource = "resourceId" in step ? resourceById.get(step.resourceId) : undefined;
      return `${index + 1}. ${text(step.text)}${resource ? ` — ${link(resource.title, markdownPath(resourcePath(locale, resource)))}` : ""}`;
    }));
    if (changed("questions")) body += stationSection("Questions", bullets(station.questions));
    if (changed("evidence")) body += stationSection("Evidence", bullets(station.evidence));
    if (changed("criteriaDetails")) body += stationSection("Completion criteria", criteria(station.criteriaDetails));
    if (changed("stakeholders")) body += stationSection("Role participation and responsibilities", station.stakeholders.map((role) => {
      const roleLink = catalog.routeProfiles.some((item) => item.id === role.id)
        ? link(role.title, markdownPath(`${prefix}/roles/${role.id}`)) : text(role.title);
      const responsibilities = role.responsibilities.flatMap((responsibility) => {
        const resource = resourceById.get(responsibility.resourceId);
        return resource ? [`${text(responsibility.role)}: ${link(resource.title, markdownPath(resourcePath(locale, resource)))}`] : [];
      });
      return `- ${roleLink}${role.involvement ? ` (${text(role.involvement)})` : ""}: ${text(role.description)}${responsibilities.length ? `; ${responsibilities.join("; ")}` : ""}`;
    }));
    const linkedResources = getStationResources(locale, station);
    const previousResources = baseline ? getStationResources(locale, baseline) : [];
    if (!baseline || JSON.stringify(linkedResources.map((item) => item.id)) !== JSON.stringify(previousResources.map((item) => item.id))) {
      body += stationSection("Resources", resourceLinks(linkedResources.map((resource) => resource.id)));
    }
    return body;
  };

  for (const cycle of catalog.cycles) {
    add(`${prefix}/cycles/${cycle.slug}`, cycle.title,
      `${text(cycle.description)}\n\n${text(cycle.purpose)}\n\n`
      + section("Entry criteria", criteria(cycle.entryCriteriaDetails))
      + section("Exit criteria", criteria(cycle.exitCriteriaDetails))
      + section("Stations in journey order", stationLinks(cycle.stations, cycle)), cycle.id);
  }
  for (const station of catalog.stations) {
    add(`${prefix}/stations/${station.id}`, station.title, stationBody(station)
      + section("Cycle-specific guidance", catalog.cycles.filter((cycle) => cycle.stations.some((item) => item.id === station.id)).map((cycle) =>
        `- ${link(cycle.title, markdownPath(`${prefix}/cycles/${cycle.slug}/stations/${station.id}`))}`)), station.id);
  }
  for (const cycle of catalog.cycles) {
    cycle.stations.forEach((station, index) => {
      const baseline = catalog.stations.find((item) => item.id === station.id);
      const entry = index === 0 ? cycle.entryCriteriaDetails : cycle.stations[index - 1].criteriaDetails;
      const exit = station.criteriaDetails.length ? station.criteriaDetails : cycle.exitCriteriaDetails;
      add(`${prefix}/cycles/${cycle.slug}/stations/${station.id}`, `${station.title} — ${cycle.title}`,
        `Cycle: ${link(cycle.title, markdownPath(`${prefix}/cycles/${cycle.slug}`))}\n\n`
        + `Read ${link("shared station guidance", markdownPath(`${prefix}/stations/${station.id}`))} first. The sections below supplement or replace the corresponding shared sections for this cycle. Sections not repeated here retain the shared guidance.\n\n`
        + section("Journey entry criteria", criteria(entry))
        + section("Journey exit criteria", criteria(exit))
        + stationBody(station, baseline), station.id);
    });
  }
  for (const line of catalog.lines) {
    const stations = line.stations.flatMap((id) => catalog.stations.filter((station) => station.id === id));
    add(`${prefix}/lines/${line.slug}`, line.title, `${text(line.description)}\n\n` + section("Stations in line order", stationLinks(stations)), line.id);
    for (const cycle of catalog.cycles.filter((cycle) => cycle.stations.some((station) => line.stations.includes(station.id)))) {
      const selected = line.stations.flatMap((id) => cycle.stations.filter((station) => station.id === id));
      add(`${prefix}/cycle/${cycle.slug}/lines/${line.slug}`, `${line.title} — ${cycle.title}`,
        `Shared line: ${link(line.title, markdownPath(`${prefix}/lines/${line.slug}`))}\n\nCycle: ${link(cycle.title, markdownPath(`${prefix}/cycles/${cycle.slug}`))}\n\n`
        + section("Stations in this cycle, in line order", stationLinks(selected, cycle))
        + section("Supporting stations outside this cycle", stationLinks(stations.filter((station) => !selected.some((item) => item.id === station.id)))), line.id);
    }
  }
  for (const role of catalog.routeProfiles) {
    add(`${prefix}/roles/${role.id}`, role.title, `${text(role.summary)}\n\n`
      + section("Decisions", bullets(role.decisions)) + section("Outputs", bullets(role.outputs))
      + section("Recommended resources", resourceLinks(role.recommendedResources.map((resource) => resource.id)))
      + section("Participation by cycle and station", catalog.cycles.flatMap((cycle) => cycle.stations.flatMap((station) => {
        const participation = station.stakeholders.find((item) => item.id === role.id);
        return participation ? [`- ${link(cycle.title, markdownPath(`${prefix}/cycles/${cycle.slug}`))} / ${link(station.title, markdownPath(`${prefix}/cycles/${cycle.slug}/stations/${station.id}`))}: ${text(participation.involvement)}`] : [];
      }))), role.id);
  }
  const canvases = (manifests[locale].translations as Partial<Record<Locale, typeof canvasEn.translations.en>>)[locale]!;
  for (const resource of resources) {
    let body = `${text(resource.description)}\n\nCategory: ${text(resource.category)}\n\n`
      + section("Outcomes", bullets(resource.outcomes))
      + section("How to use", resource.steps.map((step, index) => `${index + 1}. ${text(step)}`));
    if (resource.contentMarkdown) {
      const source = resource.sourcePath?.endsWith(".json") ? `\`\`\`json\n${resource.contentMarkdown}\n\`\`\`` : resource.contentMarkdown;
      body += `## Source content\n\n${source}\n\n`;
    }
    if (resource.sourceUrl) body += `Source: ${resource.sourceUrl}\n\n`;
    const canvas = resource.canvasId ? canvases[resource.canvasId as keyof typeof canvases] : undefined;
    if (canvas) {
      body += `## Canvas guidance\n\n${text(canvas.purpose)}\n\n${text(canvas.howToUse)}\n\n`;
      body += `License: ${text(canvas.metadata.license)}\n\nAuthors: ${canvas.metadata.authors.map(text).join(", ")}\n\n`;
      for (const part of [...canvas.sections].sort((a, b) => a.fillOrder - b.fillOrder)) {
        body += `### ${text(part.title)}\n\n${text(part.description)}\n\n`;
      }
    }
    body += section("Related stations", stationLinks(catalog.stations.filter((station) => getStationResources(locale, station).some((item) => item.id === resource.id))));
    add(resourcePath(locale, resource), resource.title, body, resource.id);
  }
  const overview = `APIOps Cycles is an open method for productizing reusable digital capabilities, APIs, integrations, and automation. Cycles provide journeys; lines group activities; stations describe activities and criteria; roles describe participation; resources provide practical tools.\n\n`
    + `This is a method reference generated from the published ${locale} catalog. Section headings in this export are English; method content uses the selected locale. It excludes site announcements, partner listings, design-system documentation, and interactive workspace state.\n\n`
    + `Method guidance is available under CC BY-SA 4.0; source artifacts have their own licenses. See ${link("Licensing", `${prefix}/licensing`)} and retain resource-specific attribution. Canonical method data: https://github.com/APIOpsCycles/apiops-cycles-method-data.\n\n`
    + `For structured relationships use ${link("the method graph", "/data/method-graph.json")} and ${link("the localized catalog", `/data/method-catalog.${locale}.json`)}. Match entity IDs; use the route index for page URLs.\n\n`
    + section("Method documents", documents.map((document) => `- ${link(document.title, document.path)}`));
  add(`${prefix}/`, "APIOps Cycles method reference", overview);
  documentCache.set(locale, documents);
  return documents;
}

export function fullMethodMarkdown(locale: Locale = defaultLocale) {
  const documents = methodDocuments(locale);
  const overview = documents[documents.length - 1];
  return `${overview.content}\n---\n\n${documents.slice(0, -1).map((document) => document.content).join("\n---\n\n")}`;
}
