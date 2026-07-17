export type AssetColor =
  | "strategy"
  | "product"
  | "architecture"
  | "engineering"
  | "operations"
  | "community"
  | "neutral";

export type AssetItem = {
  id: string;
  title: string;
  category:
    | "Material icon"
    | "Stakeholder icon"
    | "Method icon"
    | "Journey glyph"
    | "Human pose"
    | "Human story"
    | "Brand glyph";
  status: "stable" | "experimental" | "deprecated";
  source: string;
  symbolId?: string;
  materialIcon?: string;
  viewBox?: string;
  semantic: string;
  recommendedUse: string;
  sizes: string;
  color: AssetColor;
};

type AssetItemInput = Omit<AssetItem, "status" | "recommendedUse"> & Partial<Pick<AssetItem, "status" | "recommendedUse">>;

const methodIconSource = "/design-system/icons/apiops-iconset.svg";
const journeyGlyphSource = "/design-system/icons/apiops-metro-icons.svg";
const poseSource = "/design-system/humans/apiops-stick-figures-poses.svg";
const storySource = "/design-system/humans/apiops-stick-figures-stories.svg";

const materialMethodIcons = [
  ["analytics-outline", "Analytics", "Metrics, measurement, and improvement"],
  ["api", "API", "API contracts, products, and interface work"],
  ["area-chart-outline", "Market insights", "Market analysis and trend discovery"],
  ["brand-awareness-outline", "Brand awareness", "Publishing, adoption, and ecosystem communication"],
  ["business-center-outline", "Business goals", "Business intent and outcomes"],
  ["cases-outline", "Cases", "Business cases, portfolios, and reusable evidence"],
  ["chart-data-outline", "Data analysis", "Data products, analytics, and evidence"],
  ["check-box-outline", "Checklist", "Entry criteria, readiness checks, and checklist resources"],
  ["check-circle", "Check circle", "Completion, exit criteria, and positive readiness signals"],
  ["cloud-done-outline", "Cloud ready", "Scalable infrastructure and platform readiness"],
  ["cloud-lock-outline", "Cloud security", "Security, privacy, and controls"],
  ["code", "Code", "Development and implementation work"],
  ["code-blocks-outline", "Code blocks", "Architecture and platform decisions"],
  ["contract-outline", "Contract", "Contract-first design and agreement resources"],
  ["dashboard-outline", "Canvas", "Canvas resources and structured workspaces"],
  ["deployed-code-account-outline", "Consumer experience", "Consumer onboarding and experience"],
  ["deployed-code-alert-outline", "Alerting", "Operational alerts and exceptions"],
  ["deployed-code-outline", "Deployed code", "Delivery, publishing, and release work"],
  ["deployed-code-update-outline", "Code update", "Release changes and lifecycle updates"],
  ["design-services-outline", "Design services", "Design standards and API design work"],
  ["edit-document-outline", "Document", "Guidelines, templates, and documentation resources"],
  ["folder-code-outline", "Code folder", "Contract and implementation artifacts"],
  ["gavel-rounded", "Legal", "Legal, compliance, and governance"],
  ["globe-book-rounded", "Ecosystem", "Ecosystem vision and shared knowledge"],
  ["handshake-outline", "Handshake", "Partners, vendors, and agreements"],
  ["integration-instructions-outline", "Integration", "Integration design and flow"],
  ["list-alt-outline", "List", "Structured lists, tasks, and operating guidance"],
  ["manage-accounts-outline", "Manage accounts", "Teams, roles, and responsibilities"],
  ["money-bag-outline", "Investment", "Funding, cost, and business value"],
  ["psychology-outline", "Mindset", "Mindset, learning, and decision behavior"],
  ["rocket-launch-outline", "Launch", "Launch, rollout, and enablement"],
  ["school-outline", "Learning", "Training, facilitation, and knowledge transfer"],
  ["strategy-outline", "Strategy", "Strategy stations and strategic decisions"],
  ["trophy-outline", "Competitive advantage", "Competitive positioning and success"],
  ["user-attributes-outline", "User attributes", "User needs, experience, and personas"],
] as const;

function completeAssetMetadata(asset: AssetItemInput): AssetItem {
  return {
    ...asset,
    status: asset.status ?? "stable",
    recommendedUse: asset.recommendedUse ?? `Use when you need to communicate: ${asset.semantic.toLowerCase()}.`,
  };
}

const spriteAssetInputs: AssetItemInput[] = [
  ...materialMethodIcons.map(([id, title, semantic]) => ({
    id: `material-${id}`,
    title,
    category: "Material icon" as const,
    source: "@iconify-json/material-symbols-light",
    materialIcon: id,
    semantic,
    sizes: "16, 20, 24",
    color: "neutral" as const,
    recommendedUse: `Use for station or resource UI where method data references \`${id}\`.`,
  })),
  {
    id: "icon-insight",
    title: "Insight",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-insight",
    semantic: "Understanding emerges",
    sizes: "20, 24, 32",
    color: "strategy",
  },
  {
    id: "icon-decision",
    title: "Decision",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-decision",
    semantic: "Commit to a documented next step",
    sizes: "20, 24, 32",
    color: "product",
  },
  {
    id: "icon-conversation",
    title: "Conversation",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-conversation",
    semantic: "Better dialogue drives better outcomes",
    sizes: "20, 24, 32",
    color: "operations",
  },
  {
    id: "icon-opportunity",
    title: "Opportunity",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-opportunity",
    semantic: "Explore and create options",
    sizes: "20, 24, 32",
    color: "engineering",
  },
  {
    id: "icon-capability",
    title: "Capability",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-capability",
    semantic: "Build, integrate, and reuse",
    sizes: "20, 24, 32",
    color: "community",
  },
  {
    id: "icon-value",
    title: "Value",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-value",
    semantic: "Deliver impact that matters",
    sizes: "20, 24, 32",
    color: "strategy",
  },
  {
    id: "icon-people",
    title: "People",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-people",
    semantic: "Involve the right people",
    sizes: "20, 24, 32",
    color: "operations",
  },
  {
    id: "icon-alignment",
    title: "Alignment",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-alignment",
    semantic: "Connect around shared goals",
    sizes: "20, 24, 32",
    color: "strategy",
  },
  {
    id: "icon-risk",
    title: "Risk",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-risk",
    semantic: "Identify and mitigate early",
    sizes: "20, 24, 32",
    color: "engineering",
  },
  {
    id: "icon-quality",
    title: "Quality",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-quality",
    semantic: "Built-in quality, not bolted on",
    sizes: "20, 24, 32",
    color: "operations",
  },
  {
    id: "icon-flow",
    title: "Flow",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-flow",
    semantic: "Smooth handoffs and less friction",
    sizes: "20, 24, 32",
    color: "product",
  },
  {
    id: "icon-learn",
    title: "Learn",
    category: "Method icon",
    source: methodIconSource,
    symbolId: "icon-learn",
    semantic: "Measure, learn, and improve",
    sizes: "20, 24, 32",
    color: "community",
  },
  ...[
    ["glyph-station", "Station", "A decision point in the APIOps Cycles method", "strategy"],
    ["glyph-hub", "Hub", "A place where several routes or perspectives converge", "product"],
    ["glyph-interchange", "Interchange", "A place to move between decision tracks", "architecture"],
    ["glyph-route-split", "Route split", "A journey branches into multiple possible paths", "engineering"],
    ["glyph-arrive", "Arrive", "A journey reaches a station or milestone", "strategy"],
    ["glyph-join", "Join", "Two journeys or participants connect", "operations"],
    ["glyph-explore", "Explore", "A route opens discovery or optional paths", "engineering"],
    ["glyph-decide", "Decide", "A decision is made and captured", "product"],
    ["glyph-continue", "Continue", "The journey proceeds to the next step", "community"],
    ["glyph-learn", "Learn", "Feedback loops improve the method or output", "community"],
    ["glyph-iterate", "Iterate", "Repeat, refine, and improve over time", "operations"],
    ["glyph-publish", "Publish", "Make outputs available to consumers or collaborators", "community"],
    ["glyph-measure", "Measure", "Track evidence, metrics, and outcomes", "operations"],
    ["glyph-shared-momentum", "Shared momentum", "Participants move forward together", "product"],
    ["glyph-passengers", "Passengers", "People join a shared journey", "operations"],
    ["glyph-waiting", "Waiting", "A pause, dependency, or readiness state", "neutral"],
    ["glyph-workshop", "Workshop", "A facilitated working session", "product"],
    ["glyph-meetup", "Meetup", "Community gathering or local event", "community"],
    ["glyph-conference", "Conference", "Large-format community event", "community"],
    ["glyph-speaker", "Speaker", "Presentation, teaching, or public explanation", "community"],
  ].map(([id, title, semantic, color]) => ({
    id,
    title,
    category: "Journey glyph" as const,
    source: journeyGlyphSource,
    symbolId: id,
    semantic,
    sizes: "20, 32, 48",
    color: color as AssetColor,
  })),
  ...[
    ["pose-standing", "Standing", "Neutral participant or stakeholder presence", "neutral"],
    ["pose-walking", "Walking", "Movement through a journey or process", "engineering"],
    ["pose-pointing", "Pointing", "Directing attention to a decision, risk, or next step", "engineering"],
    ["pose-presenting", "Presenting", "Explaining a method concept or decision", "operations"],
    ["pose-discussing", "Discussing", "Stakeholders work through a shared question", "product"],
    ["pose-listening", "Listening", "Active listening and discovery", "operations"],
    ["pose-thinking", "Thinking", "Reflection, analysis, or uncertainty", "product"],
    ["pose-facilitating", "Facilitating", "Guiding a collaborative station conversation", "operations"],
    ["pose-connecting", "Connecting", "Connect decisions, people, or resources", "community"],
    ["pose-observing", "Observing", "Looking ahead, scanning, or monitoring", "community"],
  ].map(([id, title, semantic, color]) => ({
    id,
    title,
    category: "Human pose" as const,
    source: poseSource,
    symbolId: id,
    semantic,
    sizes: "48, 72, 96",
    color: color as AssetColor,
  })),
  ...[
    {
      id: "story-better-conversations",
      title: "Better conversations",
      symbolId: "g59",
      semantic: "Start with listening and shared dialogue",
      color: "strategy",
      viewBox: "20 30 225 410",
    },
    {
      id: "story-shared-decisions",
      title: "Shared decisions",
      symbolId: "g65",
      semantic: "Align decisions across functions",
      color: "product",
      viewBox: "265 30 225 410",
    },
    {
      id: "story-see-the-gaps",
      title: "See the gaps",
      symbolId: "g38",
      semantic: "Find issues and missing evidence early",
      color: "engineering",
      viewBox: "510 30 208 406",
    },
    {
      id: "story-move-forward",
      title: "Move forward",
      symbolId: "g42",
      semantic: "Take action together through a journey",
      color: "engineering",
      viewBox: "732 34 206 402",
    },
    {
      id: "story-stronger-together",
      title: "Stronger together",
      symbolId: "g44",
      semantic: "Create better outcomes through collaboration",
      color: "community",
      viewBox: "944 34 292 402",
    },
    {
      id: "story-shape-the-future",
      title: "Shape the future",
      symbolId: "g83",
      semantic: "Explore future opportunities",
      color: "community",
      viewBox: "1245 30 225 410",
    },
  ].map(({ id, title, symbolId, semantic, color, viewBox }) => ({
    id,
    title,
    category: "Human story" as const,
    source: storySource,
    symbolId,
    viewBox,
    semantic,
    sizes: "96, 160, 224",
    color: color as AssetColor,
  })),
  {
    id: "apiops-mark",
    title: "APIOps mark",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-mark.svg",
    semantic: "Master community brand mark",
    sizes: "32, 48, 64",
    color: "product",
  },
  {
    id: "apiops-logo",
    title: "APIOps logo",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-logo.svg",
    semantic: "Full APIOps brand logo",
    sizes: "128, 256",
    color: "product",
  },
  {
    id: "apiops-station-circle",
    title: "Connected station ring",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-station-circle.svg",
    semantic: "A compact symbol for connected station work",
    sizes: "32, 48, 64",
    color: "strategy",
  },
  {
    id: "apiops-check-mark",
    title: "APIOps check mark",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-check-mark.svg",
    semantic: "A positive signal for completion, readiness, or decision",
    sizes: "32, 48, 64",
    color: "product",
  },
  {
    id: "apiops-flow",
    title: "APIOps flow",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-flow.svg",
    semantic: "A horizontal journey composition for method storytelling",
    sizes: "128, 256",
    color: "community",
  },
  {
    id: "apiops-flow-en-text",
    title: "APIOps flow with text",
    category: "Brand glyph",
    source: "/design-system/glyphs/apiops-flow-en-text.svg",
    semantic: "A horizontal journey composition with English labels",
    sizes: "128, 256",
    color: "community",
  },
];

export const spriteAssets: AssetItem[] = spriteAssetInputs.map(completeAssetMetadata);
