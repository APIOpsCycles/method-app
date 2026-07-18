const baseUrl = process.env.RAW_HTML_BASE_URL ?? "http://localhost:3000";

async function fetchText(path) {
  const response = await fetch(new URL(path, baseUrl));
  const text = await response.text();
  return { status: response.status, text };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(text, expected, label) {
  assert(text.includes(expected), `${label} should include "${expected}"`);
}

const cycle = await fetchText("/cycles/api-productization-cycle");
assert(cycle.status === 200, "API Productization Cycle should return HTTP 200");
assertIncludes(cycle.text, "<h1>API Productization Cycle</h1>", "cycle raw HTML");
assertIncludes(cycle.text, "The API-focused APIOps Cycles journey", "cycle raw HTML");
assertIncludes(cycle.text, "API Product Strategy", "cycle raw HTML");
assertIncludes(cycle.text, "API Product Owner", "cycle raw HTML");
assertIncludes(cycle.text, 'type="application/ld+json"', "cycle raw HTML");
assertIncludes(cycle.text, "/stations/api-product-strategy", "cycle raw HTML");
assert(
  cycle.text.indexOf("API Productization Cycle") < cycle.text.indexOf("Loading APIOps Cycles workspace"),
  "semantic cycle content should precede the client workspace loading shell",
);

const station = await fetchText("/stations/api-product-strategy");
assert(station.status === 200, "station should return HTTP 200");
assertIncludes(station.text, "<h1>Strategy</h1>", "station raw HTML");
assertIncludes(station.text, "Frame the business need as a reusable capability", "station raw HTML");

const role = await fetchText("/roles/api-architect");
assert(role.status === 200, "role should return HTTP 200");
assertIncludes(role.text, "<h1>API Architect</h1>", "role raw HTML");
assertIncludes(role.text, "Owns API architecture", "role raw HTML");

const resource = await fetchText("/resources/customer-journey-canvas");
assert(resource.status === 200, "resource should return HTTP 200");
assertIncludes(resource.text, "<h1>Customer Journey Canvas</h1>", "resource raw HTML");

const missing = await fetchText("/cycles/nonexistent-cycle");
assert(missing.status === 404, "unknown cycle should return HTTP 404");

console.log("Raw HTML regression checks passed.");
