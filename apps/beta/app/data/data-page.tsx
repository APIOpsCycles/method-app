import Link from "next/link";
import { localePrefix, normalizeLocale } from "../public-method-data";

const shared = ["route-index.json", "mcp-method-manifest.json", "partners.json", "announcement.json"];
const localized = ["method-catalog", "site-labels", "canvas-manifest", "export-templates", "prompt-packs"];

export default function DataPage({ locale = "en" }: { locale?: string }) {
  const normalized = normalizeLocale(locale);
  return <main className="public-content"><section className="public-hero"><p className="public-kicker">Open data</p><h1>Static method data</h1><p>Download the generated JSON files for the {normalized.toUpperCase()} catalog, integrations, and offline tools.</p></section><section className="public-section"><h2>Localized files</h2><ul className="public-link-list">{localized.map((name) => <li key={name}><a href={`/data/${name}.${normalized}.json`} download>{name}.{normalized}.json</a></li>)}</ul></section><section className="public-section"><h2>Shared files</h2><ul className="public-link-list">{shared.map((name) => <li key={name}><a href={`/data/${name}`} download>{name}</a></li>)}</ul><p><Link href={`${localePrefix(normalized)}/licensing`}>Review licensing information</Link> before redistributing method content.</p></section></main>;
}
