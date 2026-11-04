import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { canvasCreatorUrl, resourcePath } from "../src/lib/resource-routes.mjs";

const root = path.resolve(import.meta.dirname, "../../..");
const fixtures = JSON.parse(await readFile(new URL("./fixtures/resource-routes.json", import.meta.url), "utf8"));

for (const locale of ["en", "fi", "fr", "de", "pt"]) {
  test(`${locale} canvas links use canonical IDs on resource and contextual station pages`, async () => {
    const artifact = JSON.parse(await readFile(path.join(root, `generated/method/method-catalog.${locale}.json`), "utf8"));
    const catalog = artifact.translations[locale];
    const prefix = locale === "en" ? "" : `/${locale}`;
    const readHtml = async (route) => (await readFile(path.join(root, "dist", route, "index.html"), "utf8")).replaceAll("&amp;", "&");
    for (const resource of catalog.resources.filter((item) => !item.draft)) {
      const html = await readHtml(resourcePath(locale, resource).slice(1));
      if (resource.canvasId) {
        const expected = `https://canvascreator.apiopscycles.com/?locale=${locale}&canvas=${resource.canvasId}`;
        assert.equal(canvasCreatorUrl(locale, resource), expected);
        assert.ok(html.includes(`href="${expected}"`), `${resource.id} opens the correct canvas`);
      } else {
        assert.equal(canvasCreatorUrl(locale, resource), undefined);
        assert.ok(!html.includes('href="https://canvascreator.apiopscycles.com/'), `${resource.id} has no canvas action`);
      }
    }
    const checkStation = async (station, route) => {
      const html = await readHtml(route.slice(1));
      const ids = new Set([...(station.resources ?? []).map((item) => item.id), ...station.steps.map((step) => step.resourceId)]);
      const expected = catalog.resources.filter((item) => !item.draft && item.canvasId && ids.has(item.id));
      assert.equal((html.match(/href="https:\/\/canvascreator\.apiopscycles\.com\//g) ?? []).length, expected.length, route);
      for (const resource of expected) {
        assert.ok(html.includes(`href="${canvasCreatorUrl(locale, resource)}"`), `${route} links to ${resource.canvasId}`);
        assert.ok(html.includes(`href="${resourcePath(locale, resource)}"`), `${route} keeps resource details available`);
      }
    };
    for (const station of catalog.stations) await checkStation(station, `${prefix}/stations/${station.id}`);
    for (const cycle of catalog.cycles) {
      for (const station of cycle.stations) await checkStation(station, `${prefix}/cycles/${cycle.slug}/stations/${station.id}`);
    }
  });
}

for (const fixture of fixtures) {
  test(fixture.description, async () => {
    assert.equal(resourcePath(fixture.locale, fixture.resource), fixture.expected);
    if (fixture.assertStaticHtml) {
      const artifact = (await import(`../../../generated/method/method-catalog.${fixture.locale}.json`, { with: { type: "json" } })).default;
      const generated = artifact.translations[fixture.locale].resources.find((item) => item.id === fixture.resource.id);
      assert.equal(generated?.id, "api-audit-checklist");
      assert.equal(generated?.slug, "resources/api-audit-checklist");
      const html = await readFile(path.join(root, "dist", fixture.expected.slice(1), "index.html"), "utf8");
      assert.match(html, /All concept checklist items are audited/);
      assert.match(html, /<ul class="task-list">/);
      assert.match(html, /<input type="checkbox" disabled/);
      assert.doesNotMatch(html, /api-audit-chekclist/);
    }
  });
}

test("station step resource links use public slugs and point to generated Astro routes", async () => {
  const artifact = (await import("../../../generated/method/method-catalog.en.json", { with: { type: "json" } })).default;
  const catalog = artifact.translations.en;
  const resource = catalog.resources.find((item) => item.id === "customerJourneyCanvas");
  assert.ok(resource && !resource.draft, "regression resource is public");

  const href = resourcePath("en", resource);
  assert.equal(href, "/resources/customer-journey-canvas");
  const station = catalog.stations.find((item) => item.steps.some((step) => step.resourceId === resource.id));
  assert.ok(station, "a station references the regression resource");
  const stationHtml = await readFile(path.join(root, "dist/stations", station.id, "index.html"), "utf8");
  assert.match(stationHtml, new RegExp(`href="${href}"`));
  await readFile(path.join(root, "dist", href.slice(1), "index.html"), "utf8");
  assert.doesNotMatch(stationHtml, /href="\/resources\/customerJourneyCanvas"/);
});
