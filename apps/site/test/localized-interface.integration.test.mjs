import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const expected = {
  fi: { primary: "Päänavigaatio", menu: "Valikko", partners: "Kumppanit", language: "Kieli", resources: "Resurssit asemalle {station}" },
  fr: { primary: "Navigation principale", menu: "Menu", partners: "Partenaires", language: "Langue", resources: "Ressources pour {station}" },
  de: { primary: "Hauptnavigation", menu: "Menü", partners: "Partner", language: "Sprache", resources: "Ressourcen für {station}" },
  pt: { primary: "Navegação principal", menu: "Menu", partners: "Parceiros", language: "Idioma", resources: "Recursos para {station}" },
};

for (const [locale, translation] of Object.entries(expected)) {
  test(`${locale} artifact contains localized shared interface labels`, async () => {
    const { default: artifact } = await import(`../../../generated/method/site-labels.${locale}.json`, { with: { type: "json" } });
    const labels = artifact.translations[locale];

    assert.equal(labels["nav.primary"], translation.primary);
    assert.equal(labels["nav.menu"], translation.menu);
    assert.equal(labels["nav.partners"], translation.partners);
    assert.equal(labels["nav.language"], translation.language);
    assert.equal(labels["resources.forStation"], translation.resources);
    for (const key of ["canvas.resourceWorkspaceAria", "canvas.resourceWorkspaceDescription", "station.compatibilityNotice"]) {
      assert.notEqual(labels[key], artifact.translations.en?.[key]);
      assert.ok(labels[key]);
    }
  });
}

test("localized shared components do not retain the reported English literals", async () => {
  const files = await Promise.all([
    "../src/components/SiteHeader.astro",
    "../src/components/islands/ResourceViewerIsland.tsx",
    "../src/components/content/ResourceContent.astro",
    "../src/components/content/StationContent.astro",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));

  const source = files.join("\n");
  for (const literal of ["Main navigation", "Toggle main navigation", "Resources for ", "This compatibility URL presents", "interactive workspace."]) {
    assert.doesNotMatch(source, new RegExp(literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
