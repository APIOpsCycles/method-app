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
