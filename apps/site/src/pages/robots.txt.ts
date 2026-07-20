import type { APIRoute } from "astro";
import { siteOrigin } from "../env";
export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nSitemap: ${siteOrigin}/sitemap.xml\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
