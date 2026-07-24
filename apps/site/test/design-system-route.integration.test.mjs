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

test("standalone symbol downloads retain their sprite styles", () => {
  const component = readFileSync(new URL("../../../packages/apiops-design-system/src/react/index.tsx", import.meta.url), "utf8");
  assert.match(component, /document\.querySelectorAll\("style"\)/);
  assert.match(component, /<defs>\$\{embeddedStyles\}\$\{symbol\.outerHTML\}<\/defs>/);
});

test("downloadable human and icon symbols use fill-only accent outlines", () => {
  const assetRoot = new URL("../../../packages/apiops-design-system/src/assets/", import.meta.url);
  const spritePaths = [
    "humans/apiops-stick-figures-poses.svg",
    "humans/apiops-stick-figures-stories.svg",
    "icons/apiops-iconset.svg",
    "icons/apiops-metro-icons.svg",
  ];
  const accentColors = ["#2f7d32", "#67389b", "#00a6a6", "#1656b8", "#e64c19"];

  for (const spritePath of spritePaths) {
    const sprite = readFileSync(new URL(spritePath, assetRoot), "utf8");
    const downloadableSymbols = [...sprite.matchAll(/<symbol\b[\s\S]*?<\/symbol>/g)].map(([symbol]) => symbol);

    assert.ok(downloadableSymbols.length > 0, `${spritePath} exposes downloadable symbols`);
    assert.doesNotMatch(sprite, /stroke\s*:\s*var\(--apiops-accent|stroke=["']var\(--apiops-accent/i);

    for (const color of accentColors) {
      const escapedColor = color.replace("#", "\\#");
      const accentStroke = new RegExp(`(?:stroke=["']${escapedColor}["']|stroke\\s*:\\s*${escapedColor})(?:[;"'])`, "i");
      assert.doesNotMatch(sprite, accentStroke, `${spritePath} must not stroke with ${color}`);
    }

    const outlinedAccents = downloadableSymbols.flatMap((symbol) =>
      [...symbol.matchAll(/<path\b[^>]*\bfill=["'](#[0-9a-f]{6})["'][^>]*\bstroke=["']none["'][^>]*>/gi)],
    );
    assert.ok(outlinedAccents.length > 0, `${spritePath} has explicit, editor-recolorable accent fills`);
  }
});
