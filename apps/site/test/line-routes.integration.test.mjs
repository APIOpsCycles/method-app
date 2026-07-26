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
    const homeHtml = await readFile(path.join(root, "dist", prefix.replace(/^\//, ""), "index.html"), "utf8");
    const homeLineLinks = [...homeHtml.matchAll(/href="([^"#?]*\/lines\/[^/"]+)"/g)].map((match) => match[1]);

    assert.equal(homeLineLinks.length, catalog.lines.length, "the home page links every line");
    assert.doesNotMatch(homeHtml, /href="[^"\s]*\/cycle[^/\s"]+\/lines\//, "the home page has no malformed line URLs");
    for (const href of homeLineLinks) {
      assert.match(href, new RegExp(`^${prefix}/lines/`), "home links are context-free");
      const linkedHtml = await readFile(path.join(root, "dist", href.replace(/^\//, ""), "index.html"), "utf8");
      assert.match(linkedHtml, new RegExp(`<link rel="canonical" href="[^"]+${href}"`));
    }
    assert.match(homeHtml, /component-url="\/_astro\/ContextualLinesSection\.[^"]+\.js"/, "line cards hydrate to preserve a stored method perspective");

    const sharedLine = catalog.lines.find((line) => catalog.cycles.filter((cycle) => line.stations.some((id) => cycle.stations.some((station) => station.id === id))).length > 1);
    assert.ok(sharedLine, "fixture includes a line shared by multiple cycles");
    const sharedCycles = catalog.cycles.filter((cycle) => sharedLine.stations.some((id) => cycle.stations.some((station) => station.id === id)));
    const genericRoute = `${prefix}/lines/${sharedLine.slug}`;
    const genericHtml = await readFile(path.join(root, "dist", genericRoute.replace(/^\//, ""), "index.html"), "utf8");
    assert.doesNotMatch(genericHtml, /data-initial-cycle-id=/, "generic page does not select a cycle");
    for (const cycle of sharedCycles) {
      assert.match(genericHtml, new RegExp(`href="${prefix}/cycle/${cycle.slug}/lines/${sharedLine.slug}"`), "every cycle is an explicit choice");
    }
    assert.match(genericHtml, new RegExp(`href="${prefix}/stations/${sharedLine.stations[0]}"`), "stations use neutral routes");

    for (const cycle of catalog.cycles) {
      const cycleStationIds = new Set(cycle.stations.map((station) => station.id));
      for (const line of catalog.lines.filter((candidate) => candidate.stations.some((id) => cycleStationIds.has(id)))) {
        const route = `${prefix}/cycle/${cycle.slug}/lines/${line.slug}`;
        const malformedRoute = `${prefix}/cycle${cycle.slug}/lines/${line.slug}`;
        const htmlPath = path.join(root, "dist", route.replace(/^\//, ""), "index.html");
        const html = await readFile(htmlPath, "utf8");
        assert.match(html, new RegExp(`<link rel="canonical" href="[^"]+${route}"`));
        assert.match(route, new RegExp(`/lines/${line.slug}$`));
        await assert.rejects(readFile(path.join(root, "dist", malformedRoute.replace(/^\//, ""), "index.html"), "utf8"), { code: "ENOENT" });
        for (const station of cycle.stations.filter((item) => line.stations.includes(item.id))) {
          const cycleStationRoute = `${prefix}/cycles/${cycle.slug}/stations/${station.id}`;
          assert.match(html, new RegExp(`href="${cycleStationRoute}"`));
          assert.doesNotMatch(html, new RegExp(`href="${prefix}/stations/${station.id}"`), "a current-cycle station has no competing generic link");
          assert.match(html, new RegExp(`"url":"[^"]+${cycleStationRoute}"`), "structured data uses the visible cycle station route");
          await readFile(path.join(root, "dist", cycleStationRoute.replace(/^\//, ""), "index.html"), "utf8");
        }

        const supportingStationIds = line.stations.filter((stationId) => !cycleStationIds.has(stationId));
        if (supportingStationIds.length > 0) {
          assert.match(html, /<h2 id="supporting-line-stations">Supporting line stations<\/h2>/);
          assert.match(html, /This station is outside the current cycle/);
          for (const stationId of supportingStationIds) {
            assert.match(html, new RegExp(`href="${prefix}/stations/${stationId}"`));
            assert.doesNotMatch(html, new RegExp(`${prefix}/cycles/${cycle.slug}/stations/${stationId}`));
          }
        } else {
          assert.doesNotMatch(html, /id="supporting-line-stations"/);
        }
      }
    }
  });
}
