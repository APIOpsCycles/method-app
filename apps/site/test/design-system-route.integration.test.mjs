import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import test from "node:test";

const route = new URL("../src/pages/design-system.astro", import.meta.url);
const source = readFileSync(route, "utf8");

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

test("standalone symbol downloads retain their sprite styles", () => {
  const component = readFileSync(new URL("../../../packages/apiops-design-system/src/react/index.tsx", import.meta.url), "utf8");
  assert.match(component, /document\.querySelectorAll\("style"\)/);
  assert.match(component, /<defs>\$\{embeddedStyles\}\$\{symbol\.outerHTML\}<\/defs>/);
});
