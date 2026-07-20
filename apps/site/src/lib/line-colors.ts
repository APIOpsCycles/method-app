/**
 * Application mapping from method-data line identities to design-system color
 * tokens. Method data describes the lines, but it does not own their visual
 * presentation.
 */
export const metroLineColorTokens = {
  "business-opportunities-line": "var(--color-line-business)",
  "platform-architecture-line": "var(--color-line-architecture)",
  "api-design-line": "var(--color-line-design)",
  "delivery-line": "var(--color-line-delivery)",
  "publishing-and-adoption-line": "var(--color-line-publishing)",
  "operating-model-line": "var(--color-line-operating-model)",
} as const;

export function metroLineColor(lineId: string): string {
  return metroLineColorTokens[lineId as keyof typeof metroLineColorTokens] ?? "var(--color-line-adoption)";
}
