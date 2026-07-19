import { useState } from "react";
import {
  AnnouncementToast,
  CanvasSystemFixture,
  CompactSection,
  MetroLegend,
  MetroLinePath,
  MetroMapShell,
  MetroStationButton,
  MetroStationMarker,
  PartnerCard,
  PillList,
  ResourceSelector,
  StakeholderRoleSelector,
} from "@apiops/design-system/react";

export default function DesignSystemExamples() {
  const [expanded, setExpanded] = useState(true);
  const [resource, setResource] = useState("brief");
  const [role, setRole] = useState("");
  const [station, setStation] = useState("review");
  const [toast, setToast] = useState(true);

  return <div className="ds-example-stack">
    <div className="ds-example-grid">
      <CompactSection title="Review checklist" expanded={expanded} expandLabel="Expand" collapseLabel="Collapse" onToggle={() => setExpanded(!expanded)}>
        <p>Confirm the outcome, audience, and next decision.</p>
      </CompactSection>
      <div><h3>PillList</h3><PillList label="Workshop themes" items={[{ id: "clarity", label: "Clarity" }, { id: "evidence", label: "Evidence" }, { id: "alignment", label: "Alignment" }]} /></div>
      <div><h3>ResourceSelector</h3><ResourceSelector value={resource} emptyLabel="No resources" onChange={setResource} items={[{ id: "brief", type: "Template", title: "Decision brief", description: "Capture a method-neutral decision." }, { id: "guide", type: "Guide", title: "Review guide", description: "Prepare a collaborative review." }]} /></div>
      <div><h3>PartnerCard</h3><PartnerCard href="#installation" title="Example partner" description="A neutral card for a supporting organization." /></div>
      <div><h3>StakeholderRoleSelector</h3><StakeholderRoleSelector roles={[{ id: "facilitator", title: "Facilitator" }, { id: "reviewer", title: "Reviewer" }]} value={role} label="Workshop role" placeholder="Choose a role" involvementLabels={{ lead: "Lead", core: "Core", consulted: "Consulted" }} onChange={setRole} /></div>
      <div><h3>AnnouncementToast</h3>{toast ? <AnnouncementToast dismissLabel="Dismiss announcement" onDismiss={() => setToast(false)}>The component preview is ready for review.</AnnouncementToast> : <button type="button" onClick={() => setToast(true)}>Restore announcement</button>}</div>
    </div>

    <div className="ds-metro-demo">
      <p>Tab to either station and press <kbd>Enter</kbd> or <kbd>Space</kbd>. The selected station receives a visible selection ring.</p>
      <MetroMapShell label="Method-neutral two-station metro component example" width={600} height={220}>
        <MetroLinePath id="example-route" points={[{ x: 100, y: 110 }, { x: 500, y: 110 }]} color="var(--apiops-accent-community)" selected />
        <MetroStationButton id="explore" label="Explore station" x={180} y={110} selected={station === "explore"} onSelect={setStation}><MetroStationMarker x={180} y={110} radius={10} number="1" label="Explore" labelY={145} textAnchor="middle" /></MetroStationButton>
        <MetroStationButton id="review" label="Review station, selected example" x={420} y={110} selected={station === "review"} onSelect={setStation}><MetroStationMarker x={420} y={110} radius={10} number="2" label="Review" labelY={145} textAnchor="middle" /></MetroStationButton>
        <MetroLegend x={215} y={45} items={[{ id: "example-route", label: "Example route", color: "var(--apiops-accent-community)" }]} />
      </MetroMapShell>
    </div>

    <CanvasSystemFixture />
  </div>;
}
