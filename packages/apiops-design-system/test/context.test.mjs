import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("method context patterns expose labeled, non-color state", async () => {
  const { ContextGuidance, MethodContextBar, MethodContextEditor } = await import("../dist/react/index.js");
  const bar = renderToStaticMarkup(React.createElement(MethodContextBar, { items: [{ id: "stakeholder", label: "Who", value: "API Product Owner" }, { id: "goal", label: "Why", value: "Create an API" }, { id: "cycle", label: "Cycle", value: "API Productization", href: "/cycles/api" }, { id: "here", label: "Where", value: "API Audit" }], expanded: false, changeLabel: "Change context", closeLabel: "Close", onToggle() {} }));
  assert.match(bar, /aria-expanded="false"/);
  assert.match(bar, /apiops-iconset\.svg#icon-people/);
  assert.match(bar, />API Audit</);
  const editor = renderToStaticMarkup(React.createElement(MethodContextEditor, null, React.createElement("label", null, "Goal")));
  assert.match(editor, /id="method-context-editor"/);
  const guidance = renderToStaticMarkup(React.createElement(ContextGuidance, { tone: "warning", title: "Outside your path" }, "Return when useful"));
  assert.match(guidance, /is-warning/);
  assert.match(guidance, /Outside your path/);
});

test("role participation table exposes cycle, station, involvement, and resources", async () => {
  const { RoleParticipationTable } = await import("../dist/react/index.js");
  const table = renderToStaticMarkup(React.createElement(RoleParticipationTable, {
    cycle: { id: "api", title: "API Productization", href: "/cycles/api" },
    rows: [{ station: { id: "strategy", title: "API Product Strategy", href: "/stations/strategy" }, involvement: { value: "lead", label: "Lead" }, resources: [{ id: "journey", title: "Customer Journey Canvas", href: "/resources/journey" }] }],
    labels: { station: "Station", involvement: "Involvement", resources: "Resources", noResources: "None linked" },
  }));
  assert.match(table, /<table>/);
  assert.match(table, /scope="row"/);
  assert.match(table, /data-label="Station"/);
  assert.match(table, /is-lead/);
  assert.match(table, /apiops-iconset\.svg#icon-decision/);
  assert.match(table, /Customer Journey Canvas/);
});

test("involvement legend exposes labeled lead, core, and consulted markers", async () => {
  const { InvolvementLegend } = await import("../dist/react/index.js");
  const legend = renderToStaticMarkup(React.createElement(InvolvementLegend, { label: "Stakeholder involvement", labels: { lead: "Lead", core: "Core", consulted: "Consulted" } }));
  assert.match(legend, /class="ds-involvement-legend"/);
  assert.match(legend, /aria-label="Stakeholder involvement"/);
  assert.match(legend, /is-lead.*Lead.*is-core.*Core.*is-consulted.*Consulted/);
});
