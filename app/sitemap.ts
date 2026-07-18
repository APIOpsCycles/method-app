import type { MetadataRoute } from "next";
import { allPublicPages, siteOrigin } from "./public-method-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return allPublicPages()
    .map((page) => ({
      url: page.path === "/" ? siteOrigin : `${siteOrigin}${page.path}`,
    }))
    .filter((entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    });
}
