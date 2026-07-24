import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const route = new URL("../src/pages/design-system.astro", import.meta.url);
const source = readFileSync(route, "utf8");
const layoutSource = readFileSync(new URL("../src/layouts/BaseLayout.astro", import.meta.url), "utf8");
const globalStyles = readFileSync(new URL("../src/styles/global.css", import.meta.url), "utf8");

test("the English-only design system static route documents its public contract", () => {
  assert.equal(existsSync(route), true);
  assert.match(source, /lang="en" canonicalPath="\/design-system"/);
  assert.match(source, /@apiops\/design-system\/tokens\.json/);
  assert.match(source, /General React components/);
  assert.match(source, /Metro components/);
  assert.match(source, /CanvasSystemFixture/);
  assert.match(source, /Individual SVG symbols/);
  assert.match(source, /apiops-metro-icons\.svg\?raw/);
  assert.match(source, /apiops-stick-figures-poses\.svg\?raw/);
  assert.match(source, /React export inventory/);
  assert.ok(source.indexOf("Metro components") < source.indexOf("<MetroDesignSystemExample"), "metro guidance precedes its colocated example");
});

test("the design system route has no generated localized variant", () => {
  assert.equal(existsSync(new URL("../src/pages/[locale]/design-system.astro", import.meta.url)), false);
});

test("public pages use the full device width on narrow screens", () => {
  assert.match(layoutSource, /name="viewport" content="width=device-width, initial-scale=1"/);
  assert.match(globalStyles, /\.global-site-shell \{[^}]*min-width: 0;[^}]*width: 100%;[^}]*\}/);
  assert.match(globalStyles, /\.global-site-shell > main \{[^}]*min-width: 0;[^}]*\}/);
});
