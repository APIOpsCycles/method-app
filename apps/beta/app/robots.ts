import type { MetadataRoute } from "next";
import { siteOrigin } from "./public-method-data";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/"],
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
