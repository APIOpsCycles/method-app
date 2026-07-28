import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("downloadable human and icon symbols use fill-only accent outlines", () => {
  const assetRoot = new URL("../src/assets/", import.meta.url);
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

test("SVG downloads retain embedded sprite styles", () => {
  const component = readFileSync(new URL("../src/react/index.tsx", import.meta.url), "utf8");
  assert.match(component, /document\.querySelectorAll\("style"\)/);
  assert.match(component, /<defs>\$\{embeddedStyles\}\$\{symbol\.outerHTML\}<\/defs>/);
});
