// A catalogue entry is publishable only when its reviewed release is complete.
export function validatePresentationRelease(catalog, release, readContent) {
  if (catalog.version !== release.version) throw new Error('Presentation release version mismatch');
  for (const edition of catalog.editions) {
    const artifacts = release.artifacts?.[edition.id];
    const slides = release.slides?.[edition.id];
    if (!artifacts?.content || !slides || slides.length !== edition.slideCount) {
      throw new Error(`Incomplete presentation release ${release.version}: ${edition.id}. Keep unreleased editions out of catalog.json until a complete reviewed release is prepared.`);
    }
    const model = readContent(artifacts.content.file);
    if (!Array.isArray(model?.slides) || model.slides.length !== edition.slideCount) {
      throw new Error(`Missing or incomplete presentation content: ${edition.id} (${release.version})`);
    }
  }
}
