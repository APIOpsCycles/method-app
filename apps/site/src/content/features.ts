export const features = [
  { slug: "contextual-navigation", title: "Contextual Navigation", summary: "Choose a role and goal to reveal a relevant route through the method.", marker: "01" },
  { slug: "semantic-knowledge-graph", title: "Semantic Knowledge Graph", summary: "Query explicit relationships between cycles, stations, lines, roles, goals, and resources.", marker: "02" },
  { slug: "multi-cycle-method", title: "Multi-cycle Method", summary: "Move from discovery to operation without forcing every initiative into one linear process.", marker: "03" },
  { slug: "ai-ready-method", title: "AI-ready Method", summary: "Give assistants structured, bounded method context instead of an undifferentiated document set.", marker: "04" },
  { slug: "open-json-data", title: "Open JSON Data", summary: "Build integrations from versionable, downloadable method data with stable identifiers.", marker: "05" },
  { slug: "canvas-workspace", title: "Canvas Workspace", summary: "Turn guidance into workshop output in a private, portable browser workspace.", marker: "06" },
] as const;

export type FeatureSlug = (typeof features)[number]["slug"];
