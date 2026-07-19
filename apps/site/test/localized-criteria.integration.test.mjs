import assert from "node:assert/strict";
import test from "node:test";

const locales = ["en", "fi", "fr", "de", "pt"];

for (const locale of locales) {
  test(`${locale} catalog resolves cycle and station criterion labels`, async () => {
    const [{ default: catalogArtifact }, { default: labelsArtifact }] = await Promise.all([
      import(`../../../generated/method/method-catalog.${locale}.json`, { with: { type: "json" } }),
      import(`../../../generated/method/site-labels.${locale}.json`, { with: { type: "json" } }),
    ]);
    const catalog = catalogArtifact.translations[locale];
    const labels = labelsArtifact.translations[locale];
    const details = [
      ...catalog.cycles.flatMap((cycle) => [...cycle.entryCriteriaDetails, ...cycle.exitCriteriaDetails]),
      ...catalog.stations.flatMap((station) => station.criteriaDetails),
    ];

    assert.ok(details.length > 0);
    for (const criterion of details) {
      assert.equal(criterion.title, catalog.labels[`criterion.${criterion.id}`]);
      assert.notEqual(criterion.title, criterion.id);
    }
    assert.equal(labels["section.outcomes"], catalog.labels.outcomes);
    assert.equal(labels["section.entryCriteria"], catalog.labels.entry_criteria);
    assert.equal(labels["section.exitCriteria"], catalog.labels.exit_criteria);
  });
}
