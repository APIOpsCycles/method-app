import type { APIRoute } from "astro";
import { canonicalUrl } from "../env";
import { defaultLocale, getCatalog, locales, localePrefix } from "../lib/method-data";
import { fullMarkdownPath, markdownPath } from "../lib/method-markdown";

const link = (title: string, path: string, description: string) =>
  `- [${title}](${canonicalUrl(path)}): ${description}`;

export const GET: APIRoute = () => {
  const catalog = getCatalog(defaultLocale);
  const content = [
    "# APIOps Cycles",
    "",
    "> An open method for productizing reusable digital capabilities, APIs, integrations, and automation. This site provides method guidance, role-based journeys, practical resources, and structured method data.",
    "",
    "Cycles provide context-specific journeys. Lines group related activities. Stations describe activities, steps, and criteria; a station can participate in multiple cycles and lines. Roles describe stakeholder participation. Resources include canvases, guides, and other tools used in activities.",
    "",
    "To answer a method question, start with the user's goal and relevant cycle. Use the method graph to find related stations, roles, and resources, then read the relevant page for detailed guidance. Prefer cycle-specific station pages when a cycle is known; shared station pages provide general context. Use route-index.json to resolve entity IDs to public URLs rather than guessing URLs from titles.",
    "",
    "For structured retrieval, start with a localized method catalog and the locale-neutral method graph. Join graph keys and referenced IDs to catalog id fields; goal IDs join to method-goals.json. Use files with the same locale suffix together. IDs are stable join keys, not necessarily the labels displayed on pages. Fetch relevant linked files as needed rather than loading the entire site.",
    "",
    "The MCP manifest describes static data and prospective tools; it is not a live MCP server or an executable tool endpoint. Read the licensing page before reusing content: method guidance and source artifacts have different licenses.",
    "",
    `Available locale codes: ${locales.join(", ")}. The default locale (${defaultLocale}) uses unprefixed page URLs; other languages use /{locale}/. JSON files use .{locale}.json suffixes.`,
    "",
    "Public method entity pages have Markdown versions at the same path with .md appended; language home references use /index.md or /{locale}/index.md. Start with a language's method reference to discover individual documents. Cycle-specific station documents describe changes to shared station guidance: read the linked shared document first. Full downloads combine these same documents once per URL, in one language, for bulk ingestion. They cover the method reference, not every website page.",
    "",
    "## Start here",
    link("Method reference (Markdown)", markdownPath("/"), "Method concepts and an index of individual Markdown documents."),
    link("Static method data", "/data", "Data descriptions, join guidance, and downloads."),
    link("Frequently asked questions", "/faq", "Method explanations and common questions."),
    link("Licensing", "/licensing", "Reuse, attribution, and licenses for method content and source artifacts."),
    "",
    "## Cycles",
    ...catalog.cycles.map((cycle) => link(cycle.title, markdownPath(`/cycles/${cycle.slug}`), cycle.description)),
    "",
    "## Structured relationships and discovery",
    link("Method graph", "/data/method-graph.json", "Locale-neutral indexes by cycle, station, line, stakeholder, resource, and goal."),
    link("Method goals", "/data/method-goals.json", "Localized labels and descriptions for goal IDs in the graph."),
    link("Route index", "/data/route-index.json", "Public method entity routes across locales."),
    link("Static MCP manifest", "/data/mcp-method-manifest.json", "Data inventory, canonical identifiers, source provenance, and prospective MCP tool names."),
    link("Sitemap", "/sitemap.xml", "Complete public page inventory, including language alternates."),
    "",
    "## Languages and localized data",
    ...locales.flatMap((locale) => [
      link(`${locale} method reference (Markdown)`, markdownPath(`${localePrefix(locale)}/`), `Method document index for locale ${locale}.`),
      link(`${locale} method catalog`, `/data/method-catalog.${locale}.json`, "Localized entities, descriptions, steps, and criteria."),
      link(`${locale} canvas manifest`, `/data/canvas-manifest.${locale}.json`, "Canvas definitions, sections, prompts, and guidance."),
      link(`${locale} prompt packs`, `/data/prompt-packs.${locale}.json`, "Reusable prompts for method activities."),
      link(`${locale} export templates`, `/data/export-templates.${locale}.json`, "Templates for offline exports."),
    ]),
    "",
    "## Optional",
    ...locales.map((locale) => link(`${locale} full method reference`, fullMarkdownPath(locale), "Combined Markdown for bulk ingestion; use individual documents for focused questions.")),
    "",
    "## Canonical source",
    "- [Method data repository](https://github.com/APIOpsCycles/apiops-cycles-method-data): Canonical source data, history, and contributions. Published JSON includes source provenance where provided.",
    "",
  ].join("\n");

  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
