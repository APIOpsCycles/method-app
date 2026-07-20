import type { APIRoute } from "astro";
import { siteOrigin } from "../env";
import { publicRouteInventory, routeAlternates } from "../lib/public-routes";

const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
export const GET: APIRoute = () => {
  const inventory = publicRouteInventory();
  const seen = new Set<string>();
  const urls = inventory.filter((route) => !seen.has(route.path) && seen.add(route.path)).map((route) => {
    const alternates = routeAlternates(route, inventory);
    const links = alternates ? Object.entries(alternates).map(([locale, path]) => `<xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(new URL(path, siteOrigin).toString())}" />`).join("") : "";
    return `<url><loc>${escapeXml(new URL(route.path, siteOrigin).toString())}</loc>${links}</url>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
