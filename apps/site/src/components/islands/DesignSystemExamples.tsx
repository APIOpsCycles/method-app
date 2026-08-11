import { useState } from "react";
import {
  AnnouncementToast,
  CanvasSystemFixture,
  CompactSection,
  ContextGuidance,
  MethodContextBar,
  MethodContextEditor,
  MetroLegend,
  MetroLinePath,
  MetroMapShell,
  MetroStationButton,
  MetroStationMarker,
  PartnerCard,
  PillList,
  ResourceSelector,
  RoleParticipationTable,
  StakeholderRoleSelector,
} from "apiops-design-system/react";
import { designSystemAssets } from "apiops-design-system/assets";

export function GeneralDesignSystemExamples() {
  const [expanded, setExpanded] = useState(true);
  const [resource, setResource] = useState("brief");
  const [role, setRole] = useState("");
  const [toast, setToast] = useState(true);
  const [pill, setPill] = useState("clarity");

  return <div className="ds-example-stack">
    <div className="ds-example-grid">
      <CompactSection title="Review checklist" expanded={expanded} expandLabel="Expand" collapseLabel="Collapse" onToggle={() => setExpanded(!expanded)}>
        <p>Confirm the outcome, audience, and next decision.</p>
      </CompactSection>
      <div><h3>PillList buttons</h3><PillList label="Workshop themes" onSelect={setPill} items={[{ id: "clarity", label: "Clarity" }, { id: "evidence", label: "Evidence" }, { id: "alignment", label: "Alignment" }]} /><p aria-live="polite">Selected: {pill}</p></div>
      <div><h3>ResourceSelector</h3><ResourceSelector value={resource} emptyLabel="No resources" onChange={setResource} items={[{ id: "brief", type: "Template", title: "Decision brief", description: "Capture a method-neutral decision." }, { id: "guide", type: "Guide", title: "Review guide", description: "Prepare a collaborative review." }]} /></div>
      <div><h3>PartnerCard</h3><PartnerCard href="#installation" title="APIOps Cycles" description="A card with an informative partner logo and accessible alternative text." logo={designSystemAssets.brand.cyclesLogoDark} logoAlt="APIOps Cycles" /></div>
      <div><h3>StakeholderRoleSelector</h3><StakeholderRoleSelector roles={[{ id: "facilitator", title: "Facilitator" }, { id: "reviewer", title: "Reviewer" }]} value={role} label="Workshop role" placeholder="Choose a role" involvementLabels={{ lead: "Lead", core: "Core", consulted: "Consulted" }} onChange={setRole} /></div>
      <div><h3>AnnouncementToast</h3>{toast ? <AnnouncementToast dismissLabel="Dismiss announcement" onDismiss={() => setToast(false)}>The component preview is ready for review.</AnnouncementToast> : <button type="button" onClick={() => setToast(true)}>Restore announcement</button>}</div>
    </div>
    <div><h3>Button and menu states</h3><p>Native controls inherit the package typography and focus treatment; component-specific buttons add selected, pressed, and disabled semantics.</p><div className="ds-canvas-toolbar"><button type="button">Primary action</button><button type="button" aria-pressed="true">Pressed action</button><button type="button" disabled>Disabled action</button><label>Example menu <select defaultValue="review"><option value="explore">Explore</option><option value="review">Review</option></select></label></div></div>
  </div>;
}

export function MetroDesignSystemExample() {
  const [station, setStation] = useState("review");
  return (
    <div className="ds-metro-demo">
      <p>Tab to either station and press <kbd>Enter</kbd> or <kbd>Space</kbd>. The selected station receives a visible selection ring.</p>
      <MetroMapShell label="Method-neutral two-station metro component example" width={600} height={220}>
        <MetroLinePath id="example-route" points={[{ x: 100, y: 110 }, { x: 500, y: 110 }]} color="var(--apiops-accent-community)" selected />
        <MetroStationButton id="explore" label="Explore station" x={180} y={110} selected={station === "explore"} onSelect={setStation}><MetroStationMarker x={180} y={110} radius={10} number="1" label="Explore" labelY={145} textAnchor="middle" /></MetroStationButton>
        <MetroStationButton id="review" label="Review station, selected example" x={420} y={110} selected={station === "review"} onSelect={setStation}><MetroStationMarker x={420} y={110} radius={10} number="2" label="Review" labelY={145} textAnchor="middle" /></MetroStationButton>
        <MetroLegend x={215} y={45} items={[{ id: "example-route", label: "Example route", color: "var(--apiops-accent-community)" }]} />
      </MetroMapShell>
    </div>
  );
}

export function ContextDesignSystemExample() {
  const [editing, setEditing] = useState(false);
  const items = [{ id: "stakeholder" as const, label: "Who", value: "API Product Owner" }, { id: "goal" as const, label: "Why", value: "Create or improve an API" }, { id: "cycle" as const, label: "Cycle", value: "API Productization Cycle", href: "#context-patterns" }, { id: "here" as const, label: "Where", value: "API Audit" }];
  return <div className="ds-example-stack"><MethodContextBar items={items} expanded={editing} changeLabel="Change context" closeLabel="Close" onToggle={() => setEditing(!editing)} />{editing && <MethodContextEditor><label>View as<select defaultValue="owner"><option value="owner">API Product Owner</option></select></label><label>Goal<select defaultValue="api"><option value="api">Create or improve an API</option></select></label><button type="button" onClick={() => setEditing(false)}>Done</button></MethodContextEditor>}<div className="ds-example-grid"><ContextGuidance tone="success" title="You are on your relevant path">Current: API Audit · Next: Publishing &amp; Enablement</ContextGuidance><ContextGuidance tone="warning" title="You are exploring outside your recommended path">Recommended start: API Product Strategy</ContextGuidance><ContextGuidance tone="neutral" title="Choose your perspective and goal">We will recommend a starting point for you.</ContextGuidance></div></div>;
}

export function RoleParticipationDesignSystemExample() {
  return <RoleParticipationTable
    cycle={{ id: "example-cycle", title: "Productization cycle", href: "#role-participation" }}
    rows={[
      { station: { id: "strategy", title: "Product strategy", href: "#role-participation" }, involvement: { value: "lead", label: "Lead" }, resources: [{ id: "value", title: "Value proposition canvas", href: "#role-participation" }] },
      { station: { id: "design", title: "Interface design", href: "#role-participation" }, involvement: { value: "core", label: "Core" }, resources: [{ id: "interaction", title: "Interaction canvas", href: "#role-participation" }] },
      { station: { id: "review", title: "Readiness review", href: "#role-participation" }, involvement: { value: "consulted", label: "Consulted" }, resources: [] },
    ]}
    labels={{ station: "Station", involvement: "Involvement", resources: "Role resources", noResources: "No role-specific resources linked." }}
  />;
}

export function CanvasDesignSystemExample() { return <CanvasSystemFixture />; }

export default GeneralDesignSystemExamples;
