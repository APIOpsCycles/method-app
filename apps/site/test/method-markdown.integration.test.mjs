import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const dist = join(root, "dist");
const read = (path) => readFileSync(join(dist, path), "utf8");
const routeIndex = JSON.parse(read("data/route-index.json"));
const files = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
  entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
const markdownFiles = files(dist).filter((path) => path.endsWith(".md"));

test("each language has a complete method reference with no duplicate document bodies", () => {
  for (const locale of routeIndex.locales) {
    const prefix = locale === routeIndex.defaultLocale ? "" : `${locale}/`;
    const full = read(`${prefix}llms-full.txt`);
    const index = read(`${prefix}index.md`);
    assert.ok(full.startsWith(index));
    const links = [...index.matchAll(/^- \[[^\n]+\]\((https?:[^)]+\.md)\)/gm)].map((match) => new URL(match[1]));
    assert.ok(links.length > 100, `method inventory for ${locale}`);
    assert.equal(new Set(links.map((url) => url.pathname)).size, links.length);
    for (const url of links) {
      const content = read(decodeURIComponent(url.pathname).slice(1));
      assert.ok(full.includes(content), `full export includes ${url.pathname}`);
      const canonical = content.match(/^Canonical page: (.+)$/m)[0];
      assert.equal(full.split(`\n${canonical}\n`).length - 1, 1, `one body for ${url.pathname}`);
      const htmlPath = new URL(content.match(/^Canonical page: (.+)$/m)[1]).pathname;
      const html = read(join(htmlPath.slice(1), "index.html"));
      assert.match(html, /rel="alternate" type="text\/markdown"/);
      assert.ok(html.includes(url.pathname), `HTML discovers ${url.pathname}`);
    }
    const catalog = JSON.parse(read(`data/method-catalog.${locale}.json`)).translations[locale];
    for (const resource of catalog.resources.filter((resource) => resource.draft)) {
      assert.ok(!full.includes(`\nEntity ID: ${resource.id}\n`), `draft excluded: ${resource.id}`);
    }
  }
});

test("all generated Markdown discovery links resolve to built resources", () => {
  const origin = new URL(read("index.md").match(/^Canonical page: (.+)$/m)[1]).origin;
  for (const path of [...markdownFiles, join(dist, "llms.txt")]) {
    for (const match of readFileSync(path, "utf8").matchAll(/\]\((https?:[^)\s]+)\)/g)) {
      const url = new URL(match[1]);
      if (url.origin !== origin) continue;
      const target = join(dist, decodeURIComponent(url.pathname));
      assert.ok(existsSync(target) || existsSync(join(target, "index.html")), `${path}: ${url.pathname}`);
    }
  }
});

test("context documents retain journey criteria and link to shared guidance", () => {
  const catalog = JSON.parse(read("data/method-catalog.en.json")).translations.en;
  const cycle = catalog.cycles[0];
  const station = cycle.stations[0];
  const content = read(`cycles/${cycle.slug}/stations/${station.id}.md`);
  assert.ok(content.includes(`/stations/${station.id}.md`));
  assert.ok(content.includes("Sections not repeated here retain the shared guidance"));
  for (const criterion of cycle.entryCriteriaDetails) assert.ok(content.includes(criterion.id));
  const resources = catalog.resources.filter((resource) => !resource.draft && resource.canvasId);
  const resource = resources[0];
  const canvasDocument = read(`${resource.slug}.md`);
  assert.match(canvasDocument, /## Canvas guidance/);
  assert.match(canvasDocument, /License:/);
  assert.match(canvasDocument, /Authors:/);
});

test("resource source content and canvas sections survive Markdown generation", () => {
  for (const locale of routeIndex.locales) {
    const catalog = JSON.parse(read(`data/method-catalog.${locale}.json`)).translations[locale];
    const canvases = JSON.parse(read(`data/canvas-manifest.${locale}.json`)).translations[locale];
    const escaped = (value) => value.replace(/([\\`*_[\]<>])/g, "\\$1").replace(/\s+/g, " ").trim();
    for (const resource of catalog.resources.filter((item) => !item.draft)) {
      const prefix = locale === routeIndex.defaultLocale ? "" : `${locale}/`;
      const content = read(`${prefix}${resource.slug}.md`);
      if (resource.contentMarkdown) assert.ok(content.includes(resource.contentMarkdown), `source preserved: ${locale}/${resource.id}`);
      if (resource.canvasId) {
        for (const part of canvases[resource.canvasId].sections) {
          assert.ok(content.includes(escaped(part.description)), `canvas guidance: ${locale}/${resource.id}/${part.id}`);
        }
      }
    }
  }
});
