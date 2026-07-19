import type { CSSProperties, ReactNode } from "react";
import { designSystemAssetPath, designSystemAssets } from "@apiops/design-system/assets";
import { AnnouncementToast, CompactSection, MetroLegend, MetroLinePath, MetroMapShell, MetroSelectionRing, MetroStationButton, MetroStationMarker, PartnerCard, PillList, ResourceSelector } from "@apiops/design-system/react";
import { MaterialIcon } from "../material-icon";
import AssetLibrary from "./asset-library";
import { spriteAssets } from "./assets";
import CanvasSystemDemo from "./canvas-system-demo";

const sections = [
  ["foundations", "Foundations"],
  ["tokens", "Tokens"],
  ["visual-language", "Visual Language"],
  ["canvas-system", "Canvas System"],
  ["components", "UI Components"],
  ["patterns", "Patterns and Guidance"],
  ["asset-library", "Asset Library"],
  ["governance", "Governance and Contribution"],
];

const tokens = [
  ["--color-neutral-graphite", "#0F172A", "Core neutral for main text and strong icons"],
  ["--color-neutral-slate", "#1E293B", "Core neutral for headings and dense UI"],
  ["--color-neutral-stone", "#334155", "Core neutral for secondary copy"],
  ["--color-neutral-cloud", "#F5F7FA", "Core neutral for page backgrounds"],
  ["--color-neutral-paper", "#FFFFFF", "Core neutral for panels and cards"],
  ["--color-line-business", "#10b981", "Business line / Deep Emerald"],
  ["--color-line-architecture", "#8b5cf6", "Architecture line / Royal Indigo"],
  ["--color-line-delivery", "#f5b30b", "Delivery line / Burnt Orange"],
  ["--color-line-publishing", "#00A6A6", "Publishing line / Teal"],
  ["--color-line-operating-model", "#1D4ED8", "Operating Model line / Cobalt"],
  ["--color-line-design", "#ef4444", "Design line / Magenta"],
  ["--color-cycle-capability", "#02a972", "Capability Productization Cycle"],
  ["--color-cycle-api", "#5B5BD6", "API Productization Cycle"],
  ["--color-cycle-integration", "#8b5cf6", "Integration Productization Cycle"],
  ["--color-cycle-automation", "#0A8F98", "Automation Cycle"],
  ["--apiops-accent-business", "var(--color-cycle-api)", "SVG accent for strategy/business glyph details"],
  ["--apiops-accent-product", "var(--color-cycle-capability)", "SVG accent for product/capability glyph details"],
  ["--apiops-accent-architecture", "var(--color-cycle-integration)", "SVG accent for architecture glyph details"],
  ["--apiops-accent-engineering", "var(--color-cycle-automation)", "SVG accent for engineering glyph details"],
  ["--apiops-accent-operations", "var(--color-cycle-automation)", "SVG accent for operations glyph details"],
  ["--apiops-accent-community", "var(--color-line-operating-model)", "SVG accent for community and ecosystem"],
  ["--metro-zone--governance: #a8d7ef;", "Metro map zone for governance and compliance"],
  ["--metro-zone--strategic: #ffd75e;", "Metro map zone for strategic initiatives"],
  ["--metro-zone--consumer: #8ee6a4;", "Metro map zone for consumer-facing features"],
  ["--metro-zone--technical: #f6b16f;", "Metro map zone for technical infrastructure"],
  ["--canvas-accent", "var(--color-line-business)", "Canvas section focus and semantic emphasis"],
  ["--canvas-outer-margin", "32-48px", "Desktop canvas edge margin"],
  ["--canvas-gutter", "12-16px", "Twelve-column grid gutter"],
  ["--canvas-section-gap", "12-16px", "Space between connected zones"],
  ["--canvas-section-padding", "20-24px", "Internal section spacing"],
  ["--canvas-section-radius", "12px", "Web section radius; reduce for print"],
  ["--canvas-focus-surface", "semantic tint", "Subtle active-section surface"],
  ["--font-display", "Urbanist", "Headers and display text"],
  ["--font-body", "Inter", "Body and UI text"],
  ["--font-code", "JetBrains Mono", "Technical, code, and labels"],
];

const componentGuidance = [
  {
    title: "Buttons",
    when: "Use for explicit commands such as opening resources, exporting content, or changing a workspace mode.",
    not: "Do not use buttons for passive labels, decorative chips, or long-form navigation lists.",
    anatomy: "Label, optional icon, visible focus ring, state, and accessible name.",
    states: "Default, hover, focus-visible, active, disabled, loading, and copied confirmation.",
    accessibility: "Use a descriptive label, keep touch targets at least 44px, and do not rely on color alone.",
    tokens: ["--color-cycles-purple", "--focus-ring", "--panel-border"],
    related: ["Export menus", "Modals", "Resource selectors"],
  },
  {
    title: "Inputs and selects",
    when: "Use when users must choose a stakeholder, filter assets, or enter workshop content.",
    not: "Do not use a select when the choices are few enough to be clearer as visible buttons.",
    anatomy: "Label, control, value, helper text when needed, validation or empty state.",
    states: "Default, hover, focus-visible, disabled, invalid, empty, and filtered.",
    accessibility: "Always pair controls with visible labels and preserve keyboard operation.",
    tokens: ["--panel-bg", "--panel-border", "--focus-ring"],
    related: ["Resource selectors", "Toolbars", "Panels"],
  },
  {
    title: "Sticky notes",
    when: "Use for participant-generated canvas content and lightweight evidence.",
    not: "Do not use notes for method instructions, station names, or permanent navigation.",
    anatomy: "Short text, muted semantic surface, section ownership, and optional empty placeholder.",
    states: "Empty placeholder, filled, focused, imported, and exported.",
    accessibility: "Keep note text readable, preserve DOM order by section, and expose add/remove actions clearly.",
    tokens: ["--canvas-accent", "--panel-border", "--color-neutral-paper"],
    related: ["Canvas sections", "Canvas headers", "Export menus"],
  },
  {
    title: "Canvas sections",
    when: "Use as structured content zones inside a canvas resource linked to a Cycles station.",
    not: "Do not confuse a canvas section marker with method-level Cycles station navigation.",
    anatomy: "Section marker, title, prompt, note area, metadata inherited from the canvas, and focus state.",
    states: "Standard, focused, anchor, empty, filled, interactive, print, and presentation.",
    accessibility: "Use headings in order and keep section focus visible without color-only cues.",
    tokens: ["--canvas-accent", "--color-neutral-paper", "--panel-border"],
    related: ["Sticky notes", "Focus states", "Resource selectors"],
  },
  {
    title: "Export menus",
    when: "Use when actions copy or export related formats such as AI prompts, wiki markup, JSON, SVG, PNG, or PDF.",
    not: "Do not expose long preview text when users only need to copy a generated output.",
    anatomy: "Trigger, menu, action label, success toast, unavailable guidance, and keyboard dismissal.",
    states: "Closed, open, hover, focus-visible, copied, unavailable, and error.",
    accessibility: "Use button semantics, keyboard navigation, Escape dismissal, and live feedback after copy.",
    tokens: ["--focus-ring", "--panel-border", "--color-cycles-purple"],
    related: ["Buttons", "Toasts", "Canvas exports"],
  },
  {
    title: "Resource selectors",
    when: "Use to choose canvases, guides, examples, or checklists related to the current station.",
    not: "Do not use selectors as a substitute for station context or map navigation.",
    anatomy: "Resource type with icon, title, short purpose, selected state, source metadata, and action.",
    states: "Default, selected, opened, unavailable, and empty.",
    accessibility: "Use clear resource names and describe the result of opening or exporting.",
    tokens: ["--panel-border", "--color-line-adoption", "--focus-ring"],
    related: ["Canvas sections", "Export menus", "Material icon", "Panels"],
  },
  {
    title: "Toolbars",
    when: "Use to group compact actions that apply to the same workspace, canvas, or export task.",
    not: "Do not use a toolbar as page navigation or to hide primary decisions.",
    anatomy: "Short label, grouped buttons, disabled state for unavailable actions, and optional overflow menu.",
    states: "Default, hover, focus-visible, active, disabled, and overflow open.",
    accessibility: "Keep tab order logical, expose button labels, and avoid icon-only controls without names.",
    tokens: ["--panel-border", "--focus-ring", "--color-neutral-paper"],
    related: ["Buttons", "Export menus", "Resource selectors"],
  },
  {
    title: "Canvas headers",
    when: "Use at the top of canvas resources to identify the canvas, purpose, mode, and available exports.",
    not: "Do not use canvas headers as marketing hero sections or station summaries.",
    anatomy: "Canvas title, description, mode badge, primary action, and export actions.",
    states: "Overview, edit, guided, presentation, export, and unavailable export.",
    accessibility: "Use one clear heading and keep export actions reachable after the title in DOM order.",
    tokens: ["--canvas-accent", "--panel-border", "--color-neutral-paper"],
    related: ["Canvas sections", "Export menus", "Buttons"],
  },
  {
    title: "Guided-mode navigation",
    when: "Use when a workshop or canvas flow needs step-by-step progression.",
    not: "Do not use guided navigation for free exploration or expert catalog browsing.",
    anatomy: "Current step, total step count, previous action, next action, and completion state.",
    states: "Start, previous available, next available, blocked, complete, and skipped.",
    accessibility: "Announce step position in text and keep next/previous buttons keyboard reachable.",
    tokens: ["--focus-ring", "--canvas-accent", "--panel-border"],
    related: ["Canvas sections", "Buttons", "Focus states"],
  },
  {
    title: "Modals, tooltips, toasts, and panels",
    when: "Use for temporary feedback, focused confirmation, compact help, or secondary context.",
    not: "Do not use overlays for the primary map, route, or station navigation path.",
    anatomy: "Trigger, surface, title or label, dismiss action, content, and return focus target.",
    states: "Closed, open, focus trapped where needed, dismissed, copied, and error.",
    accessibility: "Use the correct pattern for each surface: dialog behavior for modals, live region for toasts, and labelled triggers for tooltips.",
    tokens: ["--panel-bg", "--panel-border", "--focus-ring"],
    related: ["Buttons", "Export menus", "Panels"],
  },
  {
    title: "Cycle selectors",
    when: "Use above the map when users need to switch the journey being highlighted.",
    not: "Do not mix cycle selection with metro line explanation; cycles are journeys and lines are decision tracks.",
    anatomy: "Cycle name, semantic route color, selected state, and compact responsive layout.",
    states: "Default, hover, focus-visible, selected, and unavailable.",
    accessibility: "Expose the group with an aria-label and preserve the selected state in text and styling.",
    tokens: ["--route-color", "--panel-border", "--focus-ring"],
    related: ["Routes", "Station context panels", "Metro map"],
  },
  {
    title: "Stakeholder involvement selectors",
    when: "Use with the map to highlight where a stakeholder is lead, core, or consulted.",
    not: "Do not use stakeholder selection as a replacement for station navigation.",
    anatomy: "Visible label, select control, involvement legend, and color-independent role labels.",
    states: "No stakeholder, selected stakeholder, lead, core, consulted, and empty involvement.",
    accessibility: "Keep involvement labels visible so meaning does not rely on ring style alone.",
    tokens: ["--focus-ring", "--panel-border", "--color-cycles-purple"],
    related: ["Role guide tables", "Station context panels", "Routes"],
  },
  {
    title: "Station context panels",
    when: "Use next to or below the map to summarize the current cycle station and journey criteria.",
    not: "Do not use as a resource catalog or long-form documentation page.",
    anatomy: "Cycle title, station badge, station title, description, criteria, and where-to-next cards.",
    states: "Selected station, supporting station, collapsed criteria, expanded criteria, and no next station.",
    accessibility: "Use headings in order and make collapse controls real buttons with expanded state.",
    tokens: ["--route-color", "--panel-border", "--focus-ring"],
    related: ["Line navigation cards", "Compact section headers", "Pill lists"],
  },
  {
    title: "Compact section headers",
    when: "Use in narrow side panels to collapse long question, criteria, people, or context sections.",
    not: "Do not hide primary task instructions that users must see before acting.",
    anatomy: "Section title, caret button, expanded state, and adjacent content region such as a bullet or criteria list.",
    states: "Collapsed, expanded, hover, focus-visible, empty content.",
    accessibility: "Use aria-expanded and a clear text label for the toggle.",
    tokens: ["--panel-border", "--focus-ring", "--color-cycles-purple"],
    related: ["Station context panels", "Pill lists", "Buttons"],
  },
  {
    title: "Pill lists",
    when: "Use for compact stakeholder links, filters, and short context chips.",
    not: "Do not use pills for station resources; use Resource selectors when the item has a type, icon, purpose, or selected state.",
    anatomy: "Short label, button or static state, optional empty state, and focus ring.",
    states: "Default, hover, focus-visible, active target, and empty.",
    accessibility: "Use button semantics when a pill changes the workspace and text when it is informational.",
    tokens: ["--panel-border", "--focus-ring", "--color-cycles-purple"],
    related: ["Resource selectors", "Station context panels", "Role guide tables"],
  },
  {
    title: "Line navigation cards",
    when: "Use in station context to explain previous and next reachable stations on each metro line.",
    not: "Do not use line cards for arbitrary recommendations or resource links.",
    anatomy: "Line color, line name, previous station, next station, and core/supporting labels.",
    states: "Previous only, next only, both directions, no transition, and clicked station.",
    accessibility: "Make station links keyboard reachable and label previous/next in text.",
    tokens: ["--route-color", "--panel-border", "--focus-ring"],
    related: ["Routes", "Station context panels", "Cycle selectors"],
  },
  {
    title: "Role guide tables",
    when: "Use when comparing stakeholder involvement across the selected cycle station.",
    not: "Do not use cards when users need to scan responsibilities across several stakeholders.",
    anatomy: "Stakeholder, involvement role, why they matter, and responsible resources.",
    states: "Default row, active stakeholder, no resource responsibility, and responsive stacked row.",
    accessibility: "Use table semantics or equivalent roles and preserve row headers on small screens.",
    tokens: ["--panel-border", "--color-cycles-purple", "--focus-ring"],
    related: ["Stakeholder involvement selectors", "Pill lists", "Resource selectors"],
  },
  {
    title: "Partner cards",
    when: "Use in the community section for linked organizations, contributors, and partner calls to action.",
    not: "Do not use partner cards for station resources or method content.",
    anatomy: "Logo, partner title, description, and external link affordance.",
    states: "Default, hover, focus-visible, missing logo, and external link.",
    accessibility: "Use meaningful link text and keep logos decorative when the title repeats the name.",
    tokens: ["--panel-border", "--focus-ring", "--color-neutral-paper"],
    related: ["Panels", "Buttons", "Asset Library"],
  },
  {
    title: "Announcement toasts",
    when: "Use for temporary release notes or community announcements that can be dismissed.",
    not: "Do not use for errors, required decisions, or persistent navigation.",
    anatomy: "Message, optional link, dismiss button, local-storage state, and live region.",
    states: "Delayed show, visible, dismissed, and new announcement ID.",
    accessibility: "Use a polite live region and provide a labelled dismiss button.",
    tokens: ["--color-cycles-purple", "--focus-ring", "--panel-border"],
    related: ["Modals", "Buttons", "Panels"],
  },
];

const componentCategories = [
  {
    title: "Buttons and actions",
    description: "Commands, grouped actions, export menus, and guided progression controls.",
    items: ["Buttons", "Toolbars", "Export menus", "Guided-mode navigation"],
  },
  {
    title: "Forms and selectors",
    description: "Controls that let people choose stakeholders, resources, cycles, and focused content.",
    items: ["Inputs and selects", "Resource selectors", "Cycle selectors", "Stakeholder involvement selectors"],
  },
  {
    title: "Cards, panels, and navigation",
    description: "Structured surfaces for station context, routes, compact sections, pills, people, and partners.",
    items: [
      "Station context panels",
      "Compact section headers",
      "Pill lists",
      "Line navigation cards",
      "Role guide tables",
      "Partner cards",
    ],
  },
  {
    title: "Canvas components",
    description: "Resource-specific pieces used inside canvases and canvas exports.",
    items: ["Canvas headers", "Canvas sections", "Sticky notes"],
  },
  {
    title: "Feedback and overlays",
    description: "Temporary or secondary surfaces that give feedback without replacing the main workspace.",
    items: ["Modals, tooltips, toasts, and panels", "Announcement toasts"],
  },
];

const patternExamples = [
  {
    title: "Semantic versus decorative color",
    do: "Use journey color to identify perspective, state, or route meaning.",
    dont: "Do not add color because a section feels visually empty.",
  },
  {
    title: "Canvas emphasis",
    do: "Use inherited color for section borders, focus states, and headers.",
    dont: "Do not use large saturated backgrounds or universal purple canvases.",
  },
  {
    title: "Route use",
    do: "Use routes for real sequence, dependency, or progression.",
    dont: "Do not use route lines as decorative dividers.",
  },
  {
    title: "Button hierarchy",
    do: "Use one primary action per decision area and neutral secondary actions.",
    dont: "Do not give every button the same weight.",
  },
  {
    title: "Focus states",
    do: "Keep focus visible, high-contrast, and independent from semantic color.",
    dont: "Do not remove outlines or rely on hover-only feedback.",
  },
  {
    title: "Icons and human figures",
    do: "Use icons for concepts and human figures for collaboration or storytelling.",
    dont: "Do not use people as decoration or to imply a specific identity.",
  },
];

const relatedHrefByLabel: Record<string, string> = {
  "Asset Library": "#asset-library",
  Buttons: "#buttons",
  "Canvas exports": "#export-menus",
  "Canvas headers": "#canvas-sections",
  "Canvas sections": "#canvas-sections",
  "Export menus": "#export-menus",
  "Focus states": "#accessibility",
  "Human figure": "#asset-library",
  "Human pose": "#asset-library",
  "Journey glyph": "#asset-library",
  "Material icon": "#asset-library",
  Modals: "#modals-tooltips-toasts-and-panels",
  "Modals, tooltips, toasts, and panels": "#modals-tooltips-toasts-and-panels",
  "Announcement toasts": "#announcement-toasts",
  "Compact section headers": "#compact-section-headers",
  "Cycle selectors": "#cycle-selectors",
  "Line navigation cards": "#line-navigation-cards",
  "Metro map": "#visual-language",
  Panels: "#resource-selectors",
  "Partner cards": "#partner-cards",
  "Pill lists": "#pill-lists",
  "Resource selectors": "#resource-selectors",
  Routes: "#visual-language",
  "Role guide tables": "#role-guide-tables",
  "Station context panels": "#station-context-panels",
  "Stakeholder involvement selectors": "#stakeholder-involvement-selectors",
  "Sticky notes": "#sticky-notes",
  "Toasts": "#export-menus",
  Tokens: "#tokens",
  Toolbars: "#buttons",
  "Stakeholder icon": "#asset-library",
};

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function DocHeader({ locale }: { locale: string }) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return (
    <header className="app-header ds-header">
      <div className="topbar">
        <a className="brand" href={`${prefix}/`}>
          <img className="brand__logo" src={designSystemAssets.brand.cyclesLogo} alt="" />
          <span>APIOps Cycles</span>
        </a>
        <nav className="ds-topnav" aria-label="Design system sections">
          {sections.map(([id, title]) => (
            <a key={id} href={`#${id}`}>
              {title}
            </a>
          ))}
          <a href={`${prefix}/`}>Method site</a>
        </nav>
      </div>
    </header>
  );
}

function TokenTable({ rows }: { rows: string[][] }) {
  function isSwatchable(value: string) {
    return value.startsWith("#") || value.startsWith("var(--color") || value.startsWith("var(--apiops") || value.startsWith("var(--canvas");
  }

  function isFontToken(name: string) {
    return name.startsWith("--font-");
  }

  return (
    <div className="ds-token-table">
      <div className="ds-token-table__row ds-token-table__row--head">
        <strong>Token</strong>
        <strong>Value</strong>
        <strong>Use</strong>
      </div>
      {rows.map(([name, value, use]) => (
        <div className="ds-token-table__row" key={name}>
          <code>{name}</code>
          <span className="ds-token-value">
            {isSwatchable(value) ? (
              <i style={{ "--swatch": value } as CSSProperties} />
            ) : isFontToken(name) ? (
              <em className="ds-token-font-sample" style={{ "--token-font": `var(${name})` } as CSSProperties} aria-hidden="true">
                AaBbCc0123
              </em>
            ) : (
              <em aria-hidden="true">Aa</em>
            )}
            <code>{value}</code>
          </span>
          <span>{use}</span>
        </div>
      ))}
    </div>
  );
}

function ComponentPreview({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="ds-preview">
      <h3>{title}</h3>
      <div className="ds-preview__surface">{children}</div>
    </article>
  );
}

function ComponentDemo({ title }: { title: string }) {
  switch (title) {
    case "Buttons":
      return <ButtonStateDemo />;
    case "Toolbars":
      return <ToolbarStateDemo />;
    case "Inputs and selects":
      return <ControlStateDemo />;
    case "Sticky notes":
      return (
        <div className="sticky-notes">
          <button type="button">Customer goal</button>
          <button type="button">Open risk</button>
        </div>
      );
    case "Export menus":
      return <ExportMenuStateDemo />;
    case "Resource selectors":
      return <ResourceSelectorStateDemo />;
    case "Canvas headers":
      return <CanvasHeaderStateDemo />;
    case "Guided-mode navigation":
      return <GuidedNavigationStateDemo />;
    case "Modals, tooltips, toasts, and panels":
      return <FeedbackSurfaceStateDemo />;
    case "Cycle selectors":
      return <CycleSelectorStateDemo />;
    case "Stakeholder involvement selectors":
      return <StakeholderInvolvementStateDemo />;
    case "Station context panels":
      return <StationContextPanelDemo />;
    case "Compact section headers":
      return <CompactSectionHeaderDemo />;
    case "Pill lists":
      return <PillListStateDemo />;
    case "Line navigation cards":
      return <LineNavigationCardDemo />;
    case "Role guide tables":
      return <RoleGuideTableDemo />;
    case "Partner cards":
      return <PartnerCardDemo />;
    case "Announcement toasts":
      return <AnnouncementToastDemo />;
    default:
      return null;
  }
}

function UsageExample({ children }: { children: string }) {
  return <pre className="ds-usage-snippet">{children}</pre>;
}

function DoDontIcon({ type }: { type: "do" | "dont" }) {
  const isDo = type === "do";
  return (
    <svg
      aria-hidden="true"
      className="ds-do-dont__icon"
      style={{ "--apiops-accent": isDo ? "var(--apiops-accent-operations)" : "var(--apiops-accent-engineering)" } as CSSProperties}
      viewBox="0 0 96 96"
    >
      <use href={`${designSystemAssets.icons.method}#${isDo ? "icon-quality" : "icon-risk"}`} />
    </svg>
  );
}

function DoDont({ doItems, dontItems }: { doItems: string[]; dontItems: string[] }) {
  return (
    <div className="ds-do-dont">
      <article>
        <h3>
          Do
        </h3>
        <ul>
          {doItems.map((item) => (
            <li key={item} className="ds-do-dont__item">
              <DoDontIcon type="do" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
      <article>
        <h3>
          Do not
        </h3>
        <ul>
          {dontItems.map((item) => (
            <li key={item} className="ds-do-dont__item">
              <DoDontIcon type="dont" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}

function RelatedLinks({ items }: { items: string[] }) {
  return (
    <div className="ds-related" aria-label="Related guidance">
      <strong>Related</strong>
      {items.map((item) => (
        <a href={relatedHrefByLabel[item] ?? `#${slugify(item)}`} key={item}>
          {item}
        </a>
      ))}
    </div>
  );
}

function GuidanceCard({
  title,
  when,
  not,
  anatomy,
  states,
  accessibility,
  tokens: relatedTokens,
  related,
}: {
  title: string;
  when: string;
  not: string;
  anatomy: string;
  states: string;
  accessibility: string;
  tokens: string[];
  related: string[];
}) {
  return (
    <article className="ds-guidance-card" id={slugify(title)}>
      <h3>{title}</h3>
      <dl>
        <div>
          <dt>When to use</dt>
          <dd>{when}</dd>
        </div>
        <div>
          <dt>When not to use</dt>
          <dd>{not}</dd>
        </div>
        <div>
          <dt>Anatomy</dt>
          <dd>{anatomy}</dd>
        </div>
        <div>
          <dt>States</dt>
          <dd>{states}</dd>
        </div>
        <div>
          <dt>Accessibility</dt>
          <dd>{accessibility}</dd>
        </div>
        <div>
          <dt>Related tokens</dt>
          <dd>{relatedTokens.join(", ")}</dd>
        </div>
      </dl>
      <RelatedLinks items={related} />
    </article>
  );
}

function AnatomyPreview({ title, children, notes }: { title: string; children: ReactNode; notes: string[] }) {
  return (
    <article className="ds-anatomy">
      <h3>{title}</h3>
      <div className="ds-anatomy__preview">{children}</div>
      <ol>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ol>
    </article>
  );
}

function StatusBadge({ children }: { children: ReactNode }) {
  return <span className="ds-status">{children}</span>;
}

function ButtonAnatomyDemo() {
  return (
    <div className="ds-button-anatomy-demo">
      <button className="ds-button-primary is-annotated" type="button">
        <span aria-hidden="true">+</span>
        Open resource
      </button>
      <dl aria-label="Button anatomy labels">
        <div>
          <dt>Icon</dt>
          <dd>Optional</dd>
        </div>
        <div>
          <dt>Label</dt>
          <dd>Action verb + object</dd>
        </div>
        <div>
          <dt>Focus</dt>
          <dd>Visible ring, not color alone</dd>
        </div>
      </dl>
    </div>
  );
}

function ButtonStateDemo() {
  return (
    <div className="ds-state-stack">
      <button className="ds-button-primary" type="button">
        <span aria-hidden="true">+</span>
        Open resource
      </button>
      <button className="ds-button" type="button">
        Secondary action
      </button>
      <button className="ds-button is-focus" type="button">
        Focus visible
      </button>
      <button className="ds-button" type="button" disabled>
        Disabled
      </button>
      <button className="ds-button is-success" type="button">
        Copied
      </button>
    </div>
  );
}

function ControlStateDemo() {
  return (
    <div className="ds-state-stack">
      <label>
        <span>Label</span>
        <select defaultValue="api-designer">
          <option value="api-designer">API Designer</option>
          <option value="api-product-owner">API Product Owner</option>
        </select>
      </label>
      <label>
        <span>Filtered search</span>
        <input defaultValue="canvas" aria-label="Filtered search example" />
      </label>
      <label className="ds-field-invalid">
        <span>Invalid state</span>
        <input aria-invalid="true" defaultValue="Missing owner" />
      </label>
    </div>
  );
}

function ExportMenuStateDemo() {
  return (
    <div className="ds-state-stack">
      <div className="decision-actions ds-action-row">
        <span>Use</span>
        <button type="button" disabled>
          Map
        </button>
        <button type="button">AI</button>
        <button type="button">Wiki</button>
      </div>
      <div className="ds-action-menu" aria-label="Export menu example">
        <button className="ds-button" type="button">
          Copy AI facilitation prompt
        </button>
        <button className="ds-button" type="button">
          Copy wiki question template
        </button>
        <button className="ds-button" type="button" disabled>
          SVG export unavailable
        </button>
      </div>
    </div>
  );
}

function ToolbarStateDemo() {
  return (
    <div className="ds-toolbar" aria-label="Canvas toolbar example">
      <button className="ds-button" type="button">Export Markdown</button>
      <button className="ds-button" type="button">Export JSON</button>
      <button className="ds-button" type="button" disabled>
        Export PDF
      </button>
    </div>
  );
}

function CanvasHeaderStateDemo() {
  return (
    <div className="ds-canvas-header-preview">
      <div>
        <span>Guided mode</span>
        <strong>Customer Journey Canvas</strong>
        <p>Capture journey evidence before choosing a solution.</p>
      </div>
      <button className="ds-button" type="button">Export Markdown</button>
    </div>
  );
}

function GuidedNavigationStateDemo() {
  return (
    <div className="ds-guided-nav" aria-label="Guided canvas navigation example">
      <button className="ds-button" type="button">Previous</button>
      <span>Step 2 of 8</span>
      <button className="ds-button" type="button">Continue</button>
    </div>
  );
}

function FeedbackSurfaceStateDemo() {
  return (
    <div className="ds-feedback-surfaces">
      <div className="ds-toast-preview" role="status">
        <strong>Toast</strong>
        Copied successfully
      </div>
      <div className="ds-tooltip-row">
        <button className="ds-button" type="button" aria-describedby="tooltip-example">
          Help
        </button>
        <span id="tooltip-example">Tooltip: explain the action briefly.</span>
      </div>
      <section className="ds-context-panel" aria-label="Panel example">
        <strong>Panel</strong>
        <p>Show persistent supporting context next to the workspace.</p>
      </section>
      <section className="ds-modal-preview" aria-label="Modal example">
        <strong>Modal</strong>
        <p>Use only when the user must resolve the content before continuing.</p>
        <button className="ds-button" type="button">Close</button>
      </section>
    </div>
  );
}

function ResourceSelectorStateDemo() {
  return (
    <div style={{ maxWidth: 420 }}><ResourceSelector value="journey" emptyLabel="No direct resources" onChange={() => undefined} items={[
      { id: "journey", type: "Canvas", title: "Customer Journey Canvas", description: "Capture the real customer journey, not the solution usage itself.", icon: <MaterialIcon name="dashboard-outline" /> },
      { id: "onboarding", type: "Guide", title: "API Onboarding Best Practices", description: "Guidance for consumer onboarding, documentation, and adoption.", icon: <MaterialIcon name="edit-document-outline" /> },
    ]} /></div>
  );
}

function CycleSelectorStateDemo() {
  const cycles = [
    ["Capability Productization", "var(--color-cycle-capability)", true],
    ["API Productization", "var(--color-cycle-api)", false],
    ["Integration Productization", "var(--color-cycle-integration)", false],
    ["Automation", "var(--color-cycle-automation)", false],
  ] as const;

  return (
    <div className="ds-cycle-selector" aria-label="Cycle selector example">
      {cycles.map(([label, color, active]) => (
        <button className={active ? "is-active" : ""} key={label} style={{ "--route-color": color } as CSSProperties} type="button">
          <i aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  );
}

function StakeholderInvolvementStateDemo() {
  return (
    <div className="ds-stakeholder">
      <label>
        <span>Stakeholder involvement</span>
        <select defaultValue="api-designer">
          <option value="api-designer">API Designer</option>
          <option value="api-product-owner">API Product Owner</option>
        </select>
      </label>
      <span className="ds-involvement-legend">
        <i className="is-lead" /> Lead
        <i className="is-core" /> Core
        <i className="is-consulted" /> Consulted
      </span>
    </div>
  );
}

function StationContextPanelDemo() {
  return (
    <article className="station-summary" style={{ "--route-color": "var(--color-cycle-capability)" } as CSSProperties}>
      <p className="section-kicker">Your route on the map</p>
      <div className="station-summary__head">
        <span className="station-number">4</span>
        <div>
          <span className="you-are-here">You are here</span>
          <h3>API Design</h3>
        </div>
      </div>
      <p>Create API designs that are consistent, reusable, and grounded in business intent.</p>
      <section className="journey-criteria">
        <div className="compact-section-head">
          <h3>Before this station</h3>
          <button type="button" aria-expanded="false">▸</button>
        </div>
      </section>
      <section className="journey-criteria">
        <div className="compact-section-head">
          <h3>Ready to leave when</h3>
          <button type="button" aria-expanded="true">▾</button>
        </div>
        <ul className="criteria-list">
          <li><MaterialIcon name="check_circle" /> API contract has been reviewed.</li>
          <li><MaterialIcon name="check_circle" /> Design decisions are traceable.</li>
        </ul>
      </section>
    </article>
  );
}

function CompactSectionHeaderDemo() {
  return (
    <div style={{ maxWidth: 420 }}><CompactSection title="Key questions" expanded expandLabel="Expand" collapseLabel="Collapse">
      <ul className="criteria-list">
        <li><MaterialIcon name="check-box-outline" /> Which consumers need this API?</li>
        <li><MaterialIcon name="check-box-outline" /> What evidence is needed before moving on?</li>
      </ul>
    </CompactSection></div>
  );
}

function PillListStateDemo() {
  return <PillList label="Stakeholder chip list example" onSelect={() => undefined} items={["API Product Owner", "API Designer", "Platform Architect"].map((label) => ({ id: slugify(label), label }))} />;
}

function LineNavigationCardDemo() {
  return (
    <div className="ds-line-next">
      <strong><i style={{ background: "var(--color-line-architecture)" }} /> Platform Architecture Line</strong>
      <button type="button">
        <span>Previous - Core station</span>
        API Product Strategy
      </button>
      <button type="button">
        <span>Next - Supporting station</span>
        Scalable Infrastructure
      </button>
    </div>
  );
}

function RoleGuideTableDemo() {
  const rows = [
    ["API Designer", "Lead", "Turns validated needs into API designs.", "Domain Canvas"],
    ["API Product Owner", "Core", "Owns product value and lifecycle intent.", "API Product Brief"],
    ["Security Specialist", "Consulted", "Reviews risk, privacy, and compliance.", "No specific resource"],
  ];
  return (
    <div className="ds-role-table-demo" role="table" aria-label="Role guide table example">
      <div role="row">
        <strong role="columnheader">Stakeholder</strong>
        <strong role="columnheader">Role</strong>
        <strong role="columnheader">Why they matter</strong>
        <strong role="columnheader">Responsible resources</strong>
      </div>
      {rows.map(([stakeholder, role, why, resources], index) => (
        <div className={index === 0 ? "is-active" : ""} key={stakeholder} role="row">
          <span role="cell">{stakeholder}</span>
          <span role="cell">{role}</span>
          <span role="cell">{why}</span>
          <span role="cell">{resources}</span>
        </div>
      ))}
    </div>
  );
}

function PartnerCardDemo() {
  return <PartnerCard href="#governance" logo="/partners/osaango-black.svg" title="Osaango" description="Community partner and method contributor." />;
}

function AnnouncementToastDemo() {
  return (
    <AnnouncementToast className="ds-announcement-demo" dismissLabel="Dismiss announcement" onDismiss={() => undefined}>
        <span>Version 2.0 is live with faster loading times! See what's new </span>
        <a href="#governance">&rarr;</a>
    </AnnouncementToast>
  );
}

function SvgSpritePreview({
  source,
  symbolId,
  label,
  accent = "var(--apiops-accent-product)",
  viewBox = "0 0 96 96",
}: {
  source: string;
  symbolId: string;
  label: string;
  accent?: string;
  viewBox?: string;
}) {
  return (
    <figure className="ds-symbol-demo" style={{ "--apiops-accent": accent } as CSSProperties}>
      <svg aria-hidden="true" viewBox={viewBox}>
        <use href={`${source}#${symbolId}`} />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}


function MetroPrimitivesDemo() {
  const noop = () => undefined;
  return (
    <MetroMapShell label="Metro primitive demonstration" width={360} height={220} className="metro-map ds-metro-demo">
      <MetroLinePath id="demo-line" color="var(--color-line-business)" selected points={[{ x: 45, y: 105 }, { x: 150, y: 105 }, { x: 255, y: 55 }]} onSelect={noop} />
      <MetroStationButton id="demo-station" label="Accessible station button" x={150} y={105} selected selectionColor="var(--color-cycle-api)" onSelect={noop}>
        <MetroStationMarker x={150} y={105} radius={14} number={2} nodeClassName="metro-node" />
      </MetroStationButton>
      <MetroSelectionRing x={255} y={55} radius={19} color="var(--color-cycle-api)" />
      <MetroStationMarker x={255} y={55} radius={8} label="Station marker" labelX={270} labelY={55} />
      <MetroLegend items={[{ id: "demo-line", label: "Line path", color: "var(--color-line-business)" }]} x={45} y={175} />
    </MetroMapShell>
  );
}

export default function DesignSystemPage({ locale = "en" }: { locale?: string }) {
  return (
    <main className="site-shell ds-shell">
      <DocHeader locale={locale} />
      <section className="ds-hero">
        <p className="section-kicker">APIOps Design System</p>
        <h1>Guidance for a transit-map method experience</h1>
        <p className="ds-positioning">
          APIOps makes complex API operating models easier to understand, discuss, and improve through a shared
          visual language.
        </p>
        <dl className="ds-meta" aria-label="Design system metadata">
          <div>
            <dt>Version</dt>
            <dd>0.2 beta</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              <StatusBadge>Experimental</StatusBadge>
            </dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>July 12, 2026</dd>
          </div>
        </dl>
      </section>

      <section className="ds-section" id="foundations">
        <div className="ds-section__head">
          <p className="section-kicker">Foundations</p>
          <h2>Small rules for one shared visual language</h2>
          <p>
            The APIOps Design System provides a shared visual language for the APIOps Community, APIOps Cycles,
            CanvasCreator, workshops, documentation, presentations, and digital products. Foundations are the
            stable rules everything else is built upon.
          </p>
        </div>
        <div className="ds-grid ds-grid--two">
          <article className="ds-panel">
            <img src={designSystemAssetPath("glyphs/apiops-logo.svg")} alt="apiops" width="128" height="128"  />
            <h3>APIOps</h3>
            <p>
              APIOps is the master community brand. It represents the open community, ecosystem, events,
              publications, and the broader API operating model. Its visual identity is deep navy, neutral, and
              community-first.
            </p>
          </article>
          <article className="ds-panel">
            <img src={designSystemAssetPath("glyphs/apiops-cycles-logo.svg")} alt="apiops cycles" width="64" height="64" />
            <h3>APIOps Cycles</h3>
            <p>
              APIOps Cycles is the methodology. It uses the connected station ring, a purple methodology accent,
              and a journey-oriented visual language. 
            </p>
          </article>
        </div>
      </section>
        <section className="ds-section" id="visual-language">
        <div className="ds-section__head">
          <p className="section-kicker">Visual Language</p>
            <h2>Systems before screens</h2>
            <p>
              APIOps Cycles represents an operating model, so the visual language emphasizes relationships, journeys, structure, and collaboration.
            Cycles answer which journey someone is on. Lines answer which decision track they are looking at.
            Regions describe the landscape around the map.
          </p>
        </div>
        <div className="ds-grid ds-grid--three">
            <article className="ds-panel">
              <h3>Cycle/Line</h3>
              <p>Cycles offer specific perspectives on progression in lines and stations.</p>
              <AnatomyPreview
                title="Line anatomy"
                notes={["Semantic line color", "Rounded stroke", "Real sequence or dependency", "No decorative use"]}
              >
                <div className="ds-route-anatomy" aria-hidden="true">
                  <i />
                  <span />
                  <i />
                </div>
              </AnatomyPreview>
            </article>
            <article className="ds-panel">
              <h3>Station</h3>
              <p>Stations are a long the lines and have resources, stakeholders and entry and exit criteria.</p>
              <AnatomyPreview
                title="Station anatomy"
                notes={["Outer ring", "Neutral center", "Selected or focus state", "Label nearby, not inside the dot"]}
              >
                <SvgSpritePreview
                  source={designSystemAssetPath("icons/apiops-metro-icons.svg")}
                  symbolId="glyph-station"
                  label="Station"
                  accent="var(--apiops-accent-product)"
                />
              </AnatomyPreview>
            </article>
            <article className="ds-panel">
              <h3>Hub</h3>
              <p>Hubs are points of convergence where multiple routes or perspectives meet.</p>
              <AnatomyPreview
                title="Hub anatomy"
                notes={["Central node", "Multiple connections", "Visual emphasis", "Label nearby, not inside the dot"]}
              >
                <SvgSpritePreview
                  source={designSystemAssetPath("icons/apiops-metro-icons.svg")}
                  symbolId="glyph-hub"
                  label="Hub"
                  accent="var(--apiops-accent-business)"
                />
              </AnatomyPreview>
            </article>
            <article className="ds-panel">
              <h3>Region</h3>
              <p>Regions are conceptual areas around the map, such as Strategic, Governance, Technical, or Consumer.</p>
              <AnatomyPreview
                title="Region anatomy"
                notes={["Boundary", "Semantic color", "Label is inside, near the edge of the shape"]}
              >
                <SvgSpritePreview
                  source={designSystemAssetPath("icons/apiops-metro-icons.svg")}
                  symbolId="glyph-region"
                  label="Region"
                  accent="var(--metro-zone--governance)"
                />
              </AnatomyPreview>
            </article>
            <article className="ds-panel">
              <h3>Stakeholder</h3>
              <p>Stakeholders are abstract, inclusive representations of people and organizational roles.</p>
             <AnatomyPreview
                title="Human figure anatomy"
                notes={["Inclusive abstract pose", "Navy linework", "One semantic accent", "Use to tell a collaboration story"]}
              >
                <SvgSpritePreview
                  source={designSystemAssetPath("humans/apiops-stick-figures-poses.svg")}
                  symbolId="pose-facilitating"
                  label="Facilitating"
                  accent="var(--apiops-accent-operations)"
                />
              </AnatomyPreview>
            </article>
            <article className="ds-panel">
              <h3>Signal</h3>
              <p>Signals are states, decisions, warnings, or opportunities that should communicate meaning quickly.</p>
              <AnatomyPreview
                title="Signal anatomy"
                notes={["Distinct visual treatment", "Clear semantic meaning", "Immediate recognition", "Contextual relevance"]}
              >
                <SvgSpritePreview
                  source={designSystemAssetPath("icons/apiops-iconset.svg")}
                  symbolId="icon-risk"
                  label="Risk"
                  accent="--apiops-accent-engineering"
                />
              </AnatomyPreview>
            </article>
        </div>
        <RelatedLinks items={["Tokens", "Journey glyph", "Stakeholder icon", "Human pose"]} />
      </section>
      <section className="ds-section" id="principles">
            <h2>Collaboration is visible</h2>
            <p>
             The design language should show that better API outcomes come from shared understanding across business and technology.
            </p>
            <p>
             Every diagram, canvas, and illustration should make complex API topics easier to understand without oversimplifying them.
            </p>

          <div className="ds-grid ds-grid--two">
          <article className="ds-panel">
              <svg width="224" aria-hidden="true" className="ds-asset-size-symbol" viewBox="20 30 225 410"><use href={`${designSystemAssets.humans.stories}#g59`}></use></svg>
                          
             </article>
            <article className="ds-panel">
            <ComponentPreview title="Human figures and poses">
            <div className="ds-symbol-row">
              <SvgSpritePreview
                source={designSystemAssetPath("humans/apiops-stick-figures-poses.svg")}
                symbolId="pose-presenting"
                label="Presenting"
                accent="var(--apiops-accent-community)"
              />
              <SvgSpritePreview
                source={designSystemAssetPath("humans/apiops-stick-figures-poses.svg")}
                symbolId="pose-discussing"
                label="Discussing"
                accent="var(--apiops-accent-product)"
              />
              <SvgSpritePreview
                source={designSystemAssetPath("humans/apiops-stick-figures-poses.svg")}
                symbolId="pose-thinking"
                label="Thinking"
                accent="var(--apiops-accent-architecture)"
              />
            </div>
          </ComponentPreview>
          </article>
        </div>
        <div className="ds-grid ds-grid--three">
          {[
            [
              "Structure creates clarity",
              "Hierarchy should emerge from spacing, typography, alignment, and consistent geometry rather than decoration.",
            ],
            [
              "One language everywhere",
              "The same vocabulary should work across documentation, canvases, workshops, presentations, websites, exports, stickers, and print.",
            ],
            [
              "Accessibility is foundational",
              "Support WCAG AA contrast, keyboard navigation, visible focus, screen readers, reduced motion, and responsive layouts.",
            ],
          ].map(([title, description]) => (
            <article className="ds-panel" key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <DoDont
          doItems={[
            "Use structural consistency through grids, spacing, typography, and geometry.",
            "Use semantic journey colors only where they carry meaning.",
            "Use the same primitives across community, method, canvases, workshops, and applications.",
          ]}
          dontItems={[
            "Do not use color as the only way to convey meaning.",
            "Do not rely on heavy shadows, gradients, or decorative transit motifs.",
          ]}
        />
        <RelatedLinks items={["Buttons", "Canvas sections", "Focus states", "Asset Library"]} />
      </section>

      <section className="ds-section" id="tokens">
        <div className="ds-section__head">
          <p className="section-kicker">Tokens</p>
          <h2>Color, typography, spacing, and stroke rules</h2>
          <p>
            Tokens translate the foundations into implementation. Structural colors should make up most of the UI;
            method and journey colors should appear as accents that clarify context.
          </p>
        </div>
        <TokenTable rows={tokens} />
        <DoDont
          doItems={[
            "Use spacing to communicate grouping, hierarchy, relationships, and progression.",
            "Use thin, low-contrast borders for structure and stronger borders only for active, focus, or selected states.",
            "Use 2px strokes for icon linework and 3-4px strokes for selected station rings.",
            "Keep focus rings visible and independent from route colors.",
          ]}
          dontItems={[
            "Do not make semantic colors dominant page backgrounds.",
            "Do not use arbitrary one-off spacing adjustments.",
            "Do not use exaggerated rounding or heavy elevation.",
          ]}
        />
      </section>

      <section className="ds-section" id="canvas-system">
        <div className="ds-section__head">
          <p className="section-kicker">Canvas System</p>
          <h2>One canvas model, rendered for supported working modes</h2>
          <p>
            A canvas belongs to a Cycles station. Its sections and content remain identical across modes; only the
            rendering, controls, emphasis, and navigation change. Section markers provide orientation inside the
            resource without replacing the method-level metro map.
          </p>
        </div>
        <CanvasSystemDemo />
        <div className="ds-grid ds-grid--two">
          <article className="ds-panel">
            <h3>Interactive workspace</h3>
            <p>For the method site and CanvasCreator: editable notes, keyboard and touch operation, active-section emphasis, and zoom or focus controls.</p>
          </article>
          <article className="ds-panel">
            <h3>Print and PDF</h3>
            <p>Fixed page geometry, strong grayscale boundaries, writable space, compact hierarchy, and no interface-only controls.</p>
          </article>
          <article className="ds-panel">
            <h3>Presentation</h3>
            <p>One section at a time, progressive reveal, larger story illustration, and clear previous/continue controls.</p>
          </article>
        </div>
        <div className="ds-grid ds-grid--three">
          <article className="ds-panel">
            <h3>Three section levels</h3>
            <ul>
              <li><strong>Standard:</strong> neutral surface and low-contrast border.</li>
              <li><strong>Focus:</strong> semantic tint, stronger marker, border, and visible focus.</li>
              <li><strong>Anchor:</strong> structurally stronger central concept such as Persona or Journey.</li>
            </ul>
          </article>
          <article className="ds-panel">
            <h3>Authored grid</h3>
            <p>Current canvases use their authored layout columns, rows, and grid positions from canvas data. New canvases should prefer governed column spans and shared spacing tokens instead of arbitrary widths.</p>
          </article>
          <article className="ds-panel">
            <h3>Metadata and footer</h3>
            <p>Canvas source, license, authors, website, and optional footer copy are part of the generated canvas manifest and should travel with exports.</p>
          </article>
        </div>
        <article className="ds-panel">
          <h3>Sticky-note data contract</h3>
          <p>
            Notes use the current CanvasCreator-compatible shape: content, size, and color. Section-level note
            intent comes from canvas metadata and affects visual styling without adding unsupported note fields.
          </p>
        </article>
        <DoDont
          doItems={[
            "Use inherited line or station color for focus, headers, and borders.",
            "Keep canvas surfaces mostly neutral.",
            "Use authored canvas layout and metadata as the source of truth.",
          ]}
          dontItems={[
            "Do not use large saturated backgrounds for section surfaces.",
            "Do not add note fields that are not supported by the import/export template.",
            "Do not present canvas section markers as method-level station navigation.",
          ]}
        />
      </section>

      <section className="ds-section" id="components">
        <div className="ds-section__head">
          <p className="section-kicker">UI Components</p>
          <h2>Compact components for collaborative decisions</h2>
          <p>
            Components support the map, canvas, and resource workflows. They stay neutral by default and inherit
            semantic color only when it clarifies journey context.
          </p>
        </div>
        <div className="ds-component-grid">
          <ComponentPreview title="Metro map primitives">
            <MetroPrimitivesDemo />
            <p>Map shell, line path, marker, legend, selection ring, and keyboard-operable station button.</p>
          </ComponentPreview>
          <ComponentPreview title="Buttons">
            <ButtonStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Toolbars">
            <ToolbarStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Inputs and selects">
            <ControlStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Export menus">
            <ExportMenuStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Resource selectors">
            <ResourceSelectorStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Guided-mode navigation">
            <GuidedNavigationStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Modals, tooltips, toasts, panels">
            <FeedbackSurfaceStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Cycle selectors">
            <CycleSelectorStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Stakeholder involvement selectors">
            <StakeholderInvolvementStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Station context panels">
            <StationContextPanelDemo />
          </ComponentPreview>
          <ComponentPreview title="Compact section headers">
            <CompactSectionHeaderDemo />
          </ComponentPreview>
          <ComponentPreview title="Pill lists">
            <PillListStateDemo />
          </ComponentPreview>
          <ComponentPreview title="Line navigation cards">
            <LineNavigationCardDemo />
          </ComponentPreview>
          <ComponentPreview title="Role guide tables">
            <RoleGuideTableDemo />
          </ComponentPreview>
          <ComponentPreview title="Partner cards">
            <PartnerCardDemo />
          </ComponentPreview>
          <ComponentPreview title="Announcement toasts">
            <AnnouncementToastDemo />
          </ComponentPreview>
        </div>
        <div className="ds-guidance-grid">
          {componentGuidance.map((item) => (
            <GuidanceCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      <section className="ds-section" id="patterns">
        <div className="ds-section__head">
          <p className="section-kicker">Patterns and Guidance</p>
          <h2>Use the language consistently across decisions and artifacts</h2>
          <p>
            Patterns describe how tokens, primitives, components, icons, and canvases work together. They help the
            same design language travel from the method site to workshops, exports, and presentations.
          </p>
        </div>
        <div className="ds-pattern-grid">
          {patternExamples.map((item) => (
            <article className="ds-pattern-card" key={item.title}>
              <h3>{item.title}</h3>
              <div className="ds-pattern-card__examples">
                <div>
                  <strong>Do</strong>
                  <p>{item.do}</p>
                </div>
                <div>
                  <strong>Do not</strong>
                  <p>{item.dont}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
        <article className="ds-panel ds-accessibility" id="accessibility">
          <p className="section-kicker">Accessibility</p>
          <h3>Accessibility is part of the visual language</h3>
          <div className="ds-grid ds-grid--three">
            {[
              ["WCAG AA contrast", "Use navy-led structural colors and test accent/background pairs before release."],
              ["Keyboard navigation", "All controls, menus, dialogs, filters, and export actions must be reachable and operable by keyboard."],
              ["Visible focus", "Focus rings must remain visible and independent from semantic journey colors."],
              ["Touch target sizes", "Interactive targets should be at least 44px on touch devices."],
              ["Screen-reader labels", "Icons, export actions, resource selectors, and menus need accessible names that describe the result."],
              ["Reduced motion", "Animation must be short, optional, and disabled through reduced-motion preferences."],
              ["Color-independent meaning", "Use labels, shapes, legends, text, or position in addition to color."],
            ].map(([title, description]) => (
              <article className="ds-panel" key={title}>
                <h4>{title}</h4>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </article>
        <RelatedLinks
          items={[
            "Tokens",
            "Buttons",
            "Export menus",
            "Canvas sections",
            "Journey glyph",
            "Human figure",
          ]}
        />
      </section>

      <AssetLibrary assets={spriteAssets} />

      <section className="ds-section" id="governance">
        <div className="ds-section__head">
          <p className="section-kicker">Governance and Contribution</p>
          <h2>Change the system deliberately</h2>
          <p>
            The design system is allowed to evolve, but changes should preserve the shared visual language and avoid
            breaking existing method, canvas, export, and documentation surfaces.
          </p>
        </div>
        <div className="ds-grid ds-grid--three">
          <article className="ds-panel">
            <h3>Status model</h3>
            <p>
              <strong>Stable</strong> items are safe for production use. <strong>Experimental</strong> items are
              available for beta use and may change. <strong>Deprecated</strong> items remain documented only to help
              teams migrate away from them.
            </p>
          </article>
          <article className="ds-panel">
            <h3>Naming rules</h3>
            <p>
              Names should describe method meaning first: route, station, region, actor, signal, canvas section, note,
              resource, or export action. Avoid internal implementation names in user-facing labels.
            </p>
          </article>
          <article className="ds-panel">
            <h3>Token changes</h3>
            <p>
              Add semantic aliases before replacing raw values. Treat neutral tokens, journey colors, SVG accent hooks,
              and canvas accents as separate layers.
            </p>
          </article>
          <article className="ds-panel">
            <h3>Asset contributions</h3>
            <p>
              Add source SVGs under `design/...`, copy runtime versions to `public/design/...`, expose symbols through
              metadata, and keep geometry referenced rather than duplicated in React.
            </p>
          </article>
          <article className="ds-panel">
            <h3>Review process</h3>
            <p>
              Review contrast, keyboard access, reduced motion, responsive layout, print output, SVG theming, and
              whether the pattern is method-driven rather than decorative.
            </p>
          </article>
          <article className="ds-panel">
            <h3>Release process</h3>
            <p>
              Document status changes, update asset metadata and README guidance, run the production build, and keep
              public beta changes reversible when possible.
            </p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <a href="/">APIOps Cycles workspace</a>
        <a href="https://www.apiops.info">Community</a>
        <span>Design guidance for beta use.</span>
      </footer>
    </main>
  );
}
