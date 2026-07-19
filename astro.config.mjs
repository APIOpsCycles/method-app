import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const site =
  process.env.PUBLIC_SITE_ORIGIN ??
  process.env.NEXT_PUBLIC_SITE_ORIGIN ??
  process.env.SITE_ORIGIN ??
  "https://beta.apiopscycles.com";

export default defineConfig({
  output: "static",
  site,
  srcDir: "./apps/site/src",
  publicDir: "./public",
  outDir: "./dist",
  integrations: [react()],
});
