import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const locales = ["en", "fi", "fr", "de", "pt"];
const root = path.resolve(import.meta.dirname, "../../..");

for (const locale of locales) {
  test(`${locale} exposes every canonical line slug and valid internal links`, async () => {
    const artifact = (await import(`../../../generated/method/method-catalog.${locale}.json`, { with: { type: "json" } })).default;
    const catalog = artifact.translations[locale];
    const prefix = locale === "en" ? "" : `/${locale}`;
    for (const cycle of catalog.cycles) {
      const cycleStationIds = new Set(cycle.stations.map((station) => station.id));
      for (const line of catalog.lines.filter((candidate) => candidate.stations.some((id) => cycleStationIds.has(id)))) {
        const route = `${prefix}/cycle${cycle.slug}/lines/${line.slug}`;
        const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
        const html = await readFile(htmlPath, "utf8");
        assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+${route}"`));
        assert.match(route, new RegExp(`/lines/${line.slug}$`));
        for (const station of cycle.stations.filter((item) => line.stations.includes(item.id))) {
          assert.match(html, new RegExp(`href="${prefix}/stations/${station.id}"`));
          await readFile(path.join(root, "dist", prefix.replace(/^\//, ""), "stations", station.id, "index.html"), "utf8");
        }
      }
    }
  });
}
