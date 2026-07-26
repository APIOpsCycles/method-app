type CycleSummary = { id: string; slug: string; stations: Array<{ id: string }> };

export function initializeMetroMap(cycles: CycleSummary[], initialCycleId?: string, initialStationId?: string, neutralLineMode = false) {
  const cycleId = initialCycleId ?? cycles[0]?.id ?? "";
  const displayedCycle = cycles.find((cycle) => cycle.id === cycleId);
  const stationIsDisplayed = Boolean(initialStationId && displayedCycle?.stations.some((station) => station.id === initialStationId));

  return {
    cycleId,
    stationId: neutralLineMode || !stationIsDisplayed ? "" : initialStationId ?? "",
    hasSelectedCycle: Boolean(initialCycleId),
  };
}

export function metroStationPath(cycles: CycleSummary[], cycleId: string, stationId: string, hasSelectedCycle: boolean) {
  const selectedCycle = cycles.find((cycle) => cycle.id === cycleId);
  const isCycleStation = selectedCycle?.stations.some((station) => station.id === stationId);
  return hasSelectedCycle && isCycleStation && selectedCycle
    ? `/cycles/${selectedCycle.slug}/stations/${stationId}`
    : `/stations/${stationId}`;
}
