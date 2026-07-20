const baseUrl = process.env.RAW_HTML_BASE_URL ?? "http://localhost:3000";
const locales = ["en", "fi", "fr", "de", "pt"];

async function fetchText(path) {
  const response = await fetch(new URL(path, baseUrl));
  return { status: response.status, text: await response.text() };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertMetadata(html, route, title, schemaType, alternatePaths) {
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert(canonical && new URL(canonical).pathname === route, `${route}: canonical URL`);
  const origin = new URL(canonical).origin;
  const absolute = new URL(route, origin).toString();
  assert(html.includes(`<meta property="og:title" content="${title}`), `${route}: entity Open Graph title`);
  assert(html.includes('<meta property="og:type" content="article"'), `${route}: entity Open Graph type`);
  assert(html.includes('<meta name="twitter:card" content="summary_large_image"'), `${route}: Twitter card`);
  for (const [locale, path] of Object.entries(alternatePaths)) {
    assert(html.includes(`<link rel="alternate" hreflang="${locale}" href="${new URL(path, origin)}"`), `${route}: ${locale} alternate`);
  }
  assert(html.includes(`<link rel="alternate" hreflang="x-default" href="${new URL(alternatePaths.en, origin)}"`), `${route}: x-default alternate`);
  const json = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] ?? "null");
  assert(Array.isArray(json), `${route}: JSON-LD graph`);
  assert(json.some((node) => node["@type"] === schemaType && node.name === title && node.url === absolute), `${route}: ${schemaType} JSON-LD from visible entity`);
  assert(json.some((node) => node["@type"] === "BreadcrumbList"), `${route}: breadcrumb JSON-LD`);
}

const catalogs = Object.fromEntries(await Promise.all(locales.map(async (locale) => {
  const artifact = (await import(`../generated/method/method-catalog.${locale}.json`, { with: { type: "json" } })).default;
  return [locale, artifact.translations[locale]];
})));

// Mirror the generated public route inventory and assert metadata for every localized method entity.
function inventoryForLocale(locale) {
  const catalog = catalogs[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;
  const entities = [
    ...catalog.cycles.map((entity) => ({ kind: "cycle", key: entity.id, route: `${prefix}/cycles/${entity.slug}`, entity })),
    ...catalog.stations.map((entity) => ({ kind: "station", key: entity.id, route: `${prefix}/stations/${entity.id}`, entity })),
    ...catalog.routeProfiles.map((entity) => ({ kind: "role", key: entity.id, route: `${prefix}/roles/${entity.id}`, entity })),
    ...catalog.resources.filter((entity) => !entity.draft).map((entity) => ({ kind: "resource", key: entity.id, route: `${prefix}/${entity.slug.replace(/^\//, "")}`, entity })),
  ];
  for (const cycle of catalog.cycles) {
    for (const station of cycle.stations) entities.push({ kind: "cycleStation", key: `${cycle.id}:${station.id}`, route: `${prefix}/cycles/${cycle.slug}/stations/${station.id}`, entity: station });
    for (const line of catalog.lines.filter((candidate) => candidate.stations.some((id) => cycle.stations.some((station) => station.id === id)))) {
      entities.push({ kind: "line", key: `${cycle.id}:${line.id}`, route: `${prefix}/cycle/${cycle.slug}/lines/${line.slug}`, entity: line });
    }
  }

  return entities.map((item) => ({ ...item, locale, alternateKey: `${item.kind}:${item.key}` }));
}

const routeInventory = locales.flatMap(inventoryForLocale);
for (const locale of locales) {
  for (const item of routeInventory.filter((route) => route.locale === locale)) {
    const response = await fetchText(item.route);
    assert(response.status === 200, `${item.route}: HTTP 200`);
    const alternatePaths = Object.fromEntries(routeInventory
      .filter((alternate) => alternate.alternateKey === item.alternateKey)
      .map((alternate) => [alternate.locale, alternate.route]));
    assertMetadata(response.text, item.route, item.entity.title, item.kind === "line" ? "ItemList" : "LearningResource", alternatePaths);
  }
}

const home = await fetchText("/");
const homeJson = JSON.parse(home.text.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] ?? "null");
assert(homeJson.some((node) => node["@type"] === "WebSite"), "home: WebSite JSON-LD");

const designSystem = await fetchText("/design-system");
assert(designSystem.status === 200, "design system: HTTP 200");
assert(!designSystem.text.includes('hreflang="'), "design system must not expose localized alternates");

const missing = await fetchText("/cycles/nonexistent-cycle");
assert(missing.status === 404, "unknown cycle should return HTTP 404");
console.log("Raw HTML route-inventory regression checks passed.");
