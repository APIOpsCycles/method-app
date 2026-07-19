export function visibleCanvasSections(sections, activeSectionId, focusOnly) {
  return focusOnly ? sections.filter((section) => section.id === activeSectionId) : sections;
}
