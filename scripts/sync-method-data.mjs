import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const require = createRequire(import.meta.url);
function resolveSourceRoot() {
  if (process.env.METHOD_DATA_PATH) return process.env.METHOD_DATA_PATH;
  try {
    const enginePath = require.resolve("apiops-cycles-method-data/method-engine");
    return path.resolve(enginePath, "..", "..", "..");
  } catch {
    return path.join(root, "work", "apiops-cycles-method-data");
  }
}

const sourceRoot = resolveSourceRoot();
const methodRoot = path.join(sourceRoot, "src", "data", "method");
const canvasRoot = path.join(sourceRoot, "src", "data", "canvas");
const snippetRoot = path.join(sourceRoot, "src", "snippets");
const assetRoot = path.join(sourceRoot, "src", "assets");
const partnerRoot = path.join(sourceRoot, "public", "partners");
const partnerDataFile = path.join(sourceRoot, "src", "data", "partners.json");
const buildDataRoot = path.join(root, "generated", "method");
const publicDataRoot = path.join(root, "public", "data");
const publicAssetRoot = path.join(root, "public", "assets");
const publicPartnerRoot = path.join(root, "public", "partners");
const designGlyphRoot = path.join(root, "public", "design", "glyphs");
const announcementFile = path.join(root, "data", "announcement.json");
const locales = ["en", "fi", "fr", "de", "pt"];
const methodEngine = await import(pathToFileURL(path.join(sourceRoot, "src", "lib", "method-engine.js")));

const involvementRank = { lead: 0, core: 1, consulted: 2 };

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeArtifact(targetRoot, relativePath, value) {
  const targetPath = path.join(targetRoot, relativePath);
  mkdirSync(path.dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, `${JSON.stringify(normalizeGeneratedText(value), null, 2)}\n`);
}

function writeBuildArtifact(relativePath, value) {
  writeArtifact(buildDataRoot, relativePath, value);
}

function writePublicArtifact(relativePath, value) {
  writeArtifact(publicDataRoot, relativePath, value);
}

function normalizeGeneratedText(value) {
  if (typeof value === "string") return repairMojibake(value);
  if (Array.isArray(value)) return value.map((item) => normalizeGeneratedText(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeGeneratedText(item)]),
    );
  }
  return value;
}

function repairMojibake(value) {
  if (!/[ÃÂâ]/.test(value)) return value;
  const repaired = Buffer.from([...value].map((char) => windows1252Byte(char) ?? char.charCodeAt(0))).toString("utf8");
  return repaired.includes("\uFFFD") ? value : repaired;
}

function windows1252Byte(char) {
  return {
    "€": 0x80,
    "‚": 0x82,
    "ƒ": 0x83,
    "„": 0x84,
    "…": 0x85,
    "†": 0x86,
    "‡": 0x87,
    "ˆ": 0x88,
    "‰": 0x89,
    "Š": 0x8a,
    "‹": 0x8b,
    "Œ": 0x8c,
    "Ž": 0x8e,
    "‘": 0x91,
    "’": 0x92,
    "“": 0x93,
    "”": 0x94,
    "•": 0x95,
    "–": 0x96,
    "—": 0x97,
    "˜": 0x98,
    "™": 0x99,
    "š": 0x9a,
    "›": 0x9b,
    "œ": 0x9c,
    "ž": 0x9e,
    "Ÿ": 0x9f,
  }[char];
}

function copyMethodAsset(sourcePath, targetPath) {
  if (!existsSync(sourcePath)) return;
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

function copyPartnerAsset(logo) {
  if (!logo?.startsWith("/partners/")) return;
  const name = logo.replace("/partners/", "");
  copyMethodAsset(path.join(partnerRoot, name), path.join(publicPartnerRoot, name));
}

function copyIfExists(sourcePath, targetPath) {
  if (!existsSync(sourcePath)) return;
  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

function copyBrandOverrides() {
  copyIfExists(
    path.join(designGlyphRoot, "apiops-cycles-logo.svg"),
    path.join(publicAssetRoot, "apiops-cycles-logo.svg"),
  );
  copyIfExists(
    path.join(designGlyphRoot, "apiops-cycles-logo.svg"),
    path.join(publicAssetRoot, "apiops-cycles-logo-dark.svg"),
  );
  copyIfExists(
    path.join(designGlyphRoot, "apiops-cycles-logo-white.svg"),
    path.join(publicAssetRoot, "apiops-cycles-logo-white.svg"),
  );
  copyIfExists(
    path.join(root, "public", "favicon.svg"),
  );
  for (const size of [16, 32, 64, 256, 512]) {
    copyIfExists(
      path.join(designGlyphRoot, `favicon-${size}.png`),
      path.join(root, "public", `favicon-${size}.png`),
    );
  }
}

function readLabels(locale) {
  const dir = path.join(methodRoot, locale);
  const labels = {};
  if (!existsSync(dir)) return labels;
  const mergeLabels = (value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => mergeLabels(item));
      return;
    }
    Object.assign(labels, value);
  };
  for (const name of [
    "labels.json",
    "labels.cycles.json",
    "labels.stations.json",
    "labels.resources.json",
    "labels.criteria.json",
    "labels.stakeholders.json",
    "labels.lines.json",
  ]) {
    const file = path.join(dir, name);
    if (existsSync(file)) mergeLabels(readJson(file));
  }
  return labels;
}

function siteLabels(locale) {
  const english = {
    'chrome.breadcrumb': 'Breadcrumb',
    'entity.cycle': 'Cycle',
    'entity.station': 'Station',
    'entity.line': 'Line',
    'entity.role': 'Stakeholder guide',
    'entity.resource': 'Resource',
    'section.cycles': 'Cycles',
    'section.stations': 'Stations',
    'section.lines': 'Metro lines',
    'section.stationCycles': 'Cycles containing this station',
    'line.previous': 'Previous',
    'line.next': 'Next',
    'section.relevantCycles': 'Relevant cycles',
    'section.relevantStations': 'Relevant stations',
    'section.outcomes': 'Expected outcomes',
    'section.criteria': 'Criteria',
    'section.journeyCriteria': 'Journey criteria',
    'section.entryCriteria': 'Entry criteria',
    'section.exitCriteria': 'Exit criteria',
    'section.roles': 'Stakeholders and roles',
    'section.people': 'People to involve',
    'section.resources': 'Related resources',
    'section.resourcesCanvases': 'Resources and canvases',
    'section.recommendedResources': 'Recommended resources',
    'section.decisionsOutputs': 'Decisions and outputs',
    'section.decisions': 'Decisions',
    'section.outputs': 'Outputs',
    'section.applyWork': 'How to apply it in work',
    'section.licensing': 'Licensing',
    'section.attribution': 'Attribution and licensing',
    'section.howToUse': 'How to use it',
    'section.relatedStations': 'Related stations',
    'section.stakeholderGuides': 'Stakeholder guides',
    'section.methodMap': 'Explore the method map',
    'map.selectedCycle': 'Selected cycle map',
    'map.selectedStation': 'Selected station:',
    'map.methodKicker': 'Method map',
    'map.title': 'Navigate the method',
    'map.help': 'Select a station, cycle, or stakeholder perspective to explore the method.',
    'map.none': 'None',
    'tools.aria': 'Tools for this page',
    'tools.interactive': 'Interactive method tools',
    'tools.reviewResources': 'Review station resources',
    'tools.facilitate': 'Facilitate as',
    'tools.publish': 'Publish this',
    'resources.stationKicker': 'Station resources',
    'resources.choose': 'Choose a resource',
    'resources.viewSource': 'View original source',
    'resources.expand': 'Expand source content',
    'resources.collapse': 'Hide source content',
    'resources.emptyLinked': 'No downloadable resources are currently linked to this station.',
    'canvas.workWith': 'Work with this canvas',
    'canvas.workspaceAria': 'workspace',
    'canvas.metadata': 'Canvas metadata',
    'canvas.owner': 'Owner',
    'canvas.context': 'Context',
    'canvas.date': 'Date',
    'canvas.add': 'Add',
    'canvas.addStickyNote': 'Add a sticky note',
    'canvas.newNote': 'New note for',
    'canvas.confirmRemove': 'Remove this sticky note?',
    'exports.publishing': 'Publishing',
    'exports.title': 'Markdown and Confluence export',
    'exports.purpose': 'Export purpose',
    'exports.empty': 'No export templates are available for this item.',
    'clipboard.copied': 'Copied.',
    'clipboard.failed': 'Copy failed.',
    'prompt.kicker': 'AI facilitation',
    'prompt.title': 'Prompt pack',
    'prompt.choose': 'Choose a prompt',
    'prompt.copy': 'Copy prompt',
    'prompt.empty': 'No prompts are available for this guide.',
    'home.kicker': 'APIOps Cycles public beta',
    'home.title': 'Design and deliver better APIs with APIOps Cycles',
    'home.description': 'Explore the APIOps Cycles method as cycle journeys, stations, stakeholder guides, and reusable resources.',
    "nav.workflows": "Workflows",
    "nav.data": "Data",
    "nav.language": "Language",
    "nav.primary": "Primary",
    "nav.licensing": "Licensing",
    "nav.github": "GitHub",
    "nav.community": "Community",
    "nav.designSystem": "Design system",
    "nav.menu": "Menu",
    "controls.currentRoute": "Current route",
    "controls.stakeholderInvolvement": "View as",
    "controls.recommendedCycle": "Recommended cycle",
    "controls.currentStation": "Current station",
    "controls.routeControls": "Route controls",
    "controls.workspaceModes": "Workspace modes",
    "controls.selectCycle": "Select cycle",
    "controls.selectStakeholder": "Select stakeholder",
    "controls.goal": "What do you want to achieve today?",
    "controls.selectGoal": "Select a goal",
    "controls.resetContext": "Reset context",
    "context.label": "Current method context",
    "context.notSelected": "Not selected",
    "context.cycle": "Cycle",
    "context.here": "Here",
    "involvement.lead": "Lead",
    "involvement.core": "Core",
    "involvement.consulted": "Consulted",
    "views.map": "Metro map",
    "views.guide": "Role guide",
    "views.canvases": "Resources",
    "views.ai": "Use with AI",
    "views.confluence": "Confluence",
    "views.data": "Method data",
    "map.kicker": "Your route on the map",
    "map.instructions": "Click a station to change the selected workspace. The highlighted route shows the current cycle.",
    "map.linesTitle": "Metro lines",
    "map.linesDescription": "Lines show decision tracks across the shared APIOps backbone. Cycles show the journey for a goal.",
    "map.exportSvg": "Export SVG",
    "map.svgExported": "Metro map SVG exported.",
    "map.instructionsSvg": "Click any station dot to navigate. Use the cycle selector to switch route.",
    "map.ariaLabel": "APIOps Cycles metro map",
    "map.zoneStrategic": "Strategic",
    "map.zoneGovernance": "Governance",
    "map.zoneConsumer": "Consumer",
    "map.zoneTechnical": "Technical",
    "station.youAreHere": "You are here",
    "station.keyQuestions": "Key questions",
    "station.whereNext": "Where can I go next?",
    "station.before": "Before this station",
    "station.ready": "Ready to leave when",
    "station.previous": "Previous",
    "station.next": "Next",
    "station.coreStation": "Core station",
    "station.subStation": "Sub-station",
    "station.relatedCanvases": "Related canvases",
    "station.relatedResources": "Related resources",
    "station.people": "People to involve",
    "station.noEntryCriteria": "No entry criteria listed.",
    "station.noExitCriteria": "No exit criteria listed.",
    "station.noLineTransitions": "No line transitions are listed for this station.",
    "role.kicker": "People to involve",
    "role.titlePrefix": "Role guide for",
    "role.columnStakeholder": "Stakeholder",
    "role.columnWhy": "Why they matter",
    "role.columnRole": "Role",
    "role.columnResponsibilities": "Responsibilities",
    "role.noResponsibilities": "No specific resource ownership",
    "resources.emptyCanvases": "No canvas resources are directly linked to this station.",
    "resources.emptyOther": "No additional resources are directly linked to this station.",
    "resources.kicker": "Resources",
    "resources.titlePrefix": "Resources for",
    "resources.helper": "Select a station resource from the details panel. Canvas resources open the local sticky-note workspace; other resources open guidance, examples, or checklists here.",
    "resources.select": "Select resource",
    "resources.emptySelect": "No station resources",
    "resources.emptyStation": "No resources are directly linked to this station in the selected cycle.",
    "resources.noExternalRenderer": "No external canvas renderer is configured, so this page uses the built-in local workspace.",
    "resources.useWithAi": "Use station resources with AI",
    "resources.useWithAiHelp": "Open Resources, select a canvas or guidance item, then copy its Markdown or JSON into your AI conversation.",
    "resources.helpsAnswer": "Helps answer",
    "resources.expectedOutcomes": "Expected outcomes",
    "resources.howToUse": "How to use it",
    "resources.sourceContent": "Source content",
    "resources.source": "Source",
    "resources.details": "details",
    "canvas.localWorkspace": "Local canvas workspace",
    "canvas.focusSection": "Focus section",
    "canvas.showAll": "Show all",
    "canvas.activeSection": "Active section",
    "canvas.selectSectionInstructions": "Select a section with a pointer, or focus it and press Enter or Space.",
    "canvas.exportMenu": "Export",
    "canvas.exportMarkdown": "Export Markdown",
    "canvas.exportJson": "Export JSON",
    "canvas.importJson": "Import JSON",
    "canvas.openCreator": "Open in CanvasCreator",
    "canvas.markdownExported": "Canvas Markdown exported.",
    "canvas.jsonExported": "Canvas JSON exported.",
    "canvas.jsonImported": "Canvas JSON imported.",
    "canvas.invalidImport": "Invalid canvas import/export template",
    "canvas.removeNote": "Remove note",
    "canvas.addStickyNote": "Add note",
    "category_canvas": "Canvas",
    "category_guideline": "Guideline",
    "category_checklist": "Checklist",
    "ai.kicker": "Use with AI",
    "ai.titlePrefix": "AI assistance for",
    "ai.helper": "Use AI to facilitate the station conversation, work through the selected Resources, and turn canvas notes or resource findings into next actions.",
    "ai.facilitate": "Facilitate station discussion",
    "ai.nextAction": "Decide next action",
    "ai.facilitateTitlePrefix": "Facilitate",
    "ai.nextActionTitlePrefix": "Next actions for",
    "ai.purpose": "Purpose",
    "ai.copyPrompt": "Copy prompt",
    "ai.promptContext": "Selected APIOps Cycles context",
    "ai.promptRoute": "Route",
    "ai.promptCycle": "Cycle",
    "ai.promptStation": "Station",
    "ai.promptStationPurpose": "Station purpose",
    "ai.promptResources": "Station resources",
    "ai.promptCanvases": "Station canvases",
    "confluence.kicker": "Confluence export",
    "confluence.title": "Publishing templates",
    "confluence.helper": "Choose the purpose first, then copy the format that matches the destination. Markdown is for docs repositories and static sites. Confluence-wiki is for Confluence pages that accept wiki markup.",
    "confluence.questionTemplate": "Question template",
    "confluence.questionTemplateTitle": "Question template to fill in",
    "confluence.questionTemplateHelp": "Use this when you want to gather station answers and evidence with related canvas questions and resources.",
    "confluence.markdown": "Markdown",
    "confluence.confluenceWiki": "Confluence-wiki",
    "confluence.copyMarkdown": "Copy Markdown",
    "confluence.copyConfluenceWiki": "Copy Confluence-wiki",
    "actions.copy": "Copy",
    "actions.expandAll": "Expand all",
    "actions.collapseAll": "Collapse all",
    "actions.use": "Use",
    "actions.copied": "Copied successfully",
    "actions.expand": "▸",
    "actions.collapse": "▾",
    "confluence.cycleExport": "Cycle export",
    "confluence.audience": "Intended audience",
    "confluence.formatGuidance": "Format guidance",
    "confluence.formatGuidanceText": "Use Markdown for docs repositories and static sites. Use Confluence-wiki for Confluence pages that accept wiki markup.",
    "data.kicker": "Method data",
    "data.title": "Static integration surfaces",
    "data.helper": "These JSON files are published with the site and can be consumed by future MCP tools, documentation generators, or external canvas renderers.",
    "data.panelHelper": "All workspace views consume generated JSON under /data. No database or server-side persistence is introduced.",
    "data.sourceDependency": "Source dependency",
    "data.branch": "Branch",
    "data.localeSafe": "Locale-safe",
    "data.localeSafeText": "Default locale is {defaultLocale}; published locales are {locales}.",
    "partners.kicker": "Community and partners",
    "partners.title": "Built with the APIOps Cycles community",
    "partners.description": "APIOps Cycles is an open method. Partners help develop, use, and teach it with teams around the world.",
    "footer.license": "Licensed under CC-BY-SA 4.0.",
    "footer.github": "GitHub repository",
    "footer.community": "Community events and joining",
  };
  const translations = {
    fi: {
      "section.journeyCriteria": "Matkan kriteerit",
      "nav.workflows": "Työnkulut",
      "nav.data": "Data",
      "nav.language": "Kieli",
      "nav.primary": "Päänavigaatio",
      "nav.licensing": "Lisensointi",
      "nav.github": "GitHub",
      "nav.community": "Yhteisö",
      "nav.designSystem": "Design system",
      "nav.menu": "Valikko",
      "controls.currentRoute": "Nykyinen reitti",
      "controls.stakeholderInvolvement": "Sidosryhmän osallistuminen",
      "controls.recommendedCycle": "Suositeltu sykli",
      "controls.currentStation": "Nykyinen asema",
      "controls.routeControls": "Reitin ohjaimet",
      "controls.workspaceModes": "Työtilan tilat",
      "controls.selectCycle": "Valitse sykli",
      "controls.selectStakeholder": "Valitse sidosryhmä",
      "involvement.lead": "Vastuu",
      "involvement.core": "Ydinrooli",
      "involvement.consulted": "Konsultoitu",
      "views.map": "Metrokartta",
      "views.guide": "Rooliopas",
      "views.canvases": "Resurssit",
      "views.ai": "Käytä tekoälyn kanssa",
      "views.confluence": "Confluence",
      "views.data": "Menetelmädata",
      "map.kicker": "Reittisi kartalla",
      "map.instructions": "Valitse asema vaihtaaksesi työtilaa. Korostettu reitti näyttää nykyisen syklin.",
      "map.linesTitle": "Metrolinjat",
      "map.linesDescription": "Linjat näyttävät päätöspolut yhteisessä APIOps-rungossa. Syklit näyttävät tavoitekohtaisen matkan.",
      "map.exportSvg": "Vie SVG",
      "map.svgExported": "Metrokartan SVG viety.",
      "map.instructionsSvg": "Valitse asemapiste navigoidaksesi. Vaihda reittiä syklin valinnalla.",
      "map.ariaLabel": "APIOps Cycles -metrokartta",
      "map.zoneStrategic": "Strateginen",
      "map.zoneGovernance": "Hallinta",
      "map.zoneConsumer": "Käyttäjä",
      "map.zoneTechnical": "Tekninen",
      "station.youAreHere": "Olet tässä",
      "station.keyQuestions": "Keskeiset kysymykset",
      "station.whereNext": "Mihin voin mennä seuraavaksi?",
      "station.before": "Ennen tätä asemaa",
      "station.ready": "Valmis siirtymään, kun",
      "station.previous": "Edellinen",
      "station.next": "Seuraava",
      "station.coreStation": "Ydinasema",
      "station.subStation": "Ala-asema",
      "station.relatedCanvases": "Liittyvät canvaksit",
      "station.relatedResources": "Liittyvät resurssit",
      "station.people": "Tarvittavat sidosryhmät",
      "station.noEntryCriteria": "Aloituskriteerejä ei ole listattu.",
      "station.noExitCriteria": "Poistumiskriteerejä ei ole listattu.",
      "station.noLineTransitions": "Tälle asemalle ei ole listattu linjasiirtymiä.",
      "role.kicker": "Tarvittavat sidosryhmät",
      "role.titlePrefix": "Rooliopas asemalle",
      "role.columnStakeholder": "Sidosryhmä",
      "role.columnWhy": "Miksi he ovat tärkeitä",
      "role.columnRole": "Rooli",
      "role.columnResponsibilities": "Vastuut",
      "role.noResponsibilities": "Ei määriteltyä resurssivastuuta",
      "resources.emptyCanvases": "Tähän asemaan ei ole suoraan liitetty canvas-resursseja.",
      "resources.emptyOther": "Tähän asemaan ei ole suoraan liitetty muita resursseja.",
      "resources.kicker": "Resurssit",
      "resources.titlePrefix": "Resurssit asemalle",
      "resources.helper": "Valitse aseman resurssi lisätietopaneelista. Canvas-resurssit avautuvat paikalliseen muistilapputyötilaan; muut resurssit avaavat ohjeita, esimerkkejä tai tarkistuslistoja.",
      "resources.select": "Valitse resurssi",
      "resources.emptySelect": "Ei asemaresursseja",
      "resources.emptyStation": "Tähän asemaan ei ole suoraan liitetty resursseja valitussa syklissä.",
      "resources.noExternalRenderer": "Ulkoista canvas-renderöijää ei ole määritetty, joten sivu käyttää sisäänrakennettua paikallista työtilaa.",
      "resources.useWithAi": "Käytä aseman resursseja tekoälyn kanssa",
      "resources.useWithAiHelp": "Avaa Resurssit, valitse canvas tai ohje ja kopioi sen Markdown tai JSON tekoälykeskusteluun.",
      "resources.helpsAnswer": "Auttaa vastaamaan",
      "resources.expectedOutcomes": "Odotetut tuotokset",
      "resources.howToUse": "Kuinka käyttää",
      "resources.sourceContent": "Lähdesisältö",
      "resources.source": "Lähde",
      "resources.details": "tiedot",
      "canvas.localWorkspace": "Paikallinen canvas-työtila",
      "canvas.focusSection": "Kohdista osioon",
      "canvas.showAll": "Näytä kaikki",
      "canvas.activeSection": "Aktiivinen osio",
      "canvas.selectSectionInstructions": "Valitse osio osoittimella tai kohdista siihen ja paina Enter- tai välilyöntinäppäintä.",
      "canvas.exportMarkdown": "Vie Markdown",
      "canvas.exportJson": "Vie JSON",
      "canvas.importJson": "Tuo JSON",
      "canvas.openCreator": "Avaa CanvasCreatorissa",
      "canvas.markdownExported": "Canvas Markdown viety.",
      "canvas.jsonExported": "Canvas JSON viety.",
      "canvas.jsonImported": "Canvas JSON tuotu.",
      "canvas.invalidImport": "Virheellinen canvasin tuonti-/vientimalli",
      "canvas.removeNote": "Poista muistilappu",
      "canvas.addStickyNote": "Lisää lappu",
      "home.kicker": "APIOps Cycles public beta",
      "home.title": "Suunnittele ja toimita parempia API-rajapintoja APIOps Cycles -menetelmällä",
      "home.description": "Tutustu APIOps Cycles -menetelmään syklien, metroasemien, sidosryhmäoppaiden ja uudelleenkäytettävien resurssien avulla.",
      "category_canvas": "Canvas",
      "category_guideline": "Ohjeistus",
      "category_checklist": "Tarkistuslista",
      "ai.kicker": "Käytä tekoälyn kanssa",
      "ai.titlePrefix": "Tekoälytuki asemalle",
      "ai.helper": "Käytä tekoälyä aseman keskustelun fasilitointiin, valittujen resurssien läpikäyntiin ja canvas-muistiinpanojen tai resurssilöydösten muuttamiseen seuraaviksi toimiksi.",
      "ai.facilitate": "Fasilitoi aseman keskustelu",
      "ai.nextAction": "Päätä seuraava toimi",
      "ai.facilitateTitlePrefix": "Fasilitoi",
      "ai.nextActionTitlePrefix": "Seuraavat toimet asemalle",
      "ai.purpose": "Tarkoitus",
      "ai.copyPrompt": "Kopioi kehote",
      "ai.promptContext": "Valittu APIOps Cycles -konteksti",
      "ai.promptRoute": "Reitti",
      "ai.promptCycle": "Sykli",
      "ai.promptStation": "Asema",
      "ai.promptStationPurpose": "Aseman tarkoitus",
      "ai.promptResources": "Aseman resurssit",
      "ai.promptCanvases": "Aseman canvaksit",
      "confluence.kicker": "Confluence-vienti",
      "confluence.title": "Julkaisumallit",
      "confluence.helper": "Valitse ensin käyttötarkoitus ja kopioi sitten kohteeseen sopiva muoto. Markdown sopii dokumentaatiorepositorioihin ja staattisiin sivustoihin. Confluence-wiki sopii Confluence-sivuille, jotka hyväksyvät wiki-merkinnän.",
      "confluence.questionTemplate": "Kysymysmalli",
      "confluence.questionTemplateTitle": "Täytettävä kysymysmalli",
      "confluence.questionTemplateHelp": "Käytä tätä, kun haluat kerätä aseman vastaukset ja evidenssin liittyvien canvas-kysymysten ja resurssien avulla.",
      "confluence.markdown": "Markdown",
      "confluence.confluenceWiki": "Confluence-wiki",
      "confluence.copyMarkdown": "Kopioi Markdown",
      "confluence.copyConfluenceWiki": "Kopioi Confluence-wiki",
      "actions.copy": "Kopioi",
      "actions.expandAll": "Laajenna kaikki",
      "actions.collapseAll": "Supista kaikki",
      "actions.use": "Käytä",
      "actions.copied": "Kopioitu onnistuneesti",
      "actions.expand": "▸",
      "actions.collapse": "▾",
      "confluence.cycleExport": "Syklin vienti",
      "confluence.audience": "Kohdeyleisö",
      "confluence.formatGuidance": "Muoto-ohje",
      "confluence.formatGuidanceText": "Käytä Markdownia dokumentaatiorepositorioissa ja staattisilla sivustoilla. Käytä Confluence-wikiä Confluence-sivuilla, jotka hyväksyvät wiki-merkinnän.",
      "data.kicker": "Menetelmädata",
      "data.title": "Staattiset integraatiopinnat",
      "data.helper": "Nämä JSON-tiedostot julkaistaan sivuston mukana, ja niitä voivat käyttää tulevat MCP-työkalut, dokumentaatiogeneraattorit tai ulkoiset canvas-renderöijät.",
      "data.panelHelper": "Kaikki työtilanäkymät käyttävät /data-polun generoituja JSON-tiedostoja. Tietokantaa tai palvelinpuolen pysyvää tallennusta ei lisätä.",
      "data.sourceDependency": "Lähderiippuvuus",
      "data.branch": "Haara",
      "data.localeSafe": "Lokalisointiturvallinen",
      "data.localeSafeText": "Oletuskieli on {defaultLocale}; julkaistut kielet ovat {locales}.",
      "partners.kicker": "Yhteisö ja kumppanit",
      "partners.title": "Rakennettu APIOps Cycles -yhteisön kanssa",
      "partners.description": "APIOps Cycles on avoin menetelmä. Kumppanit auttavat kehittämään, käyttämään ja opettamaan sitä tiimeille ympäri maailmaa.",
      "footer.license": "Lisensoitu CC-BY-SA 4.0 -lisenssillä.",
      "footer.github": "GitHub-repositorio",
      "footer.community": "Yhteisötapahtumat ja liittyminen",
    },
    fr: {
      "section.journeyCriteria": "Critères du parcours",
      "nav.workflows": "Flux de travail",
      "nav.data": "Données",
      "nav.language": "Langue",
      "nav.primary": "Navigation principale",
      "nav.licensing": "Licence",
      "nav.github": "GitHub",
      "nav.community": "Communauté",
      "nav.designSystem": "Design system",
      "nav.menu": "Menu",
      "controls.currentRoute": "Parcours actuel",
      "controls.stakeholderInvolvement": "Implication des parties prenantes",
      "controls.recommendedCycle": "Cycle recommandé",
      "controls.currentStation": "Station actuelle",
      "controls.routeControls": "Contrôles du parcours",
      "controls.workspaceModes": "Modes de l'espace de travail",
      "controls.selectCycle": "Sélectionner un cycle",
      "controls.selectStakeholder": "Sélectionner une partie prenante",
      "involvement.lead": "Responsable",
      "involvement.core": "Cœur",
      "involvement.consulted": "Consulté",
      "views.map": "Plan de métro",
      "views.guide": "Guide des rôles",
      "views.canvases": "Ressources",
      "views.ai": "Utiliser avec l'IA",
      "views.confluence": "Confluence",
      "views.data": "Données méthode",
      "map.kicker": "Votre parcours sur la carte",
      "map.instructions": "Cliquez sur une station pour changer l'espace de travail sélectionné. Le parcours surligné montre le cycle actuel.",
      "map.linesTitle": "Lignes de métro",
      "map.linesDescription": "Les lignes montrent les axes de décision sur l'ossature APIOps commune. Les cycles montrent le parcours lié à un objectif.",
      "map.exportSvg": "Exporter SVG",
      "map.svgExported": "SVG du plan de métro exporté.",
      "map.instructionsSvg": "Cliquez sur un point de station pour naviguer. Utilisez le sélecteur de cycle pour changer de parcours.",
      "map.ariaLabel": "Plan de métro APIOps Cycles",
      "map.zoneStrategic": "Stratégique",
      "map.zoneGovernance": "Gouvernance",
      "map.zoneConsumer": "Consommateur",
      "map.zoneTechnical": "Technique",
      "station.youAreHere": "Vous êtes ici",
      "station.keyQuestions": "Questions clés",
      "station.whereNext": "Où aller ensuite ?",
      "station.before": "Avant cette station",
      "station.ready": "Prêt à partir lorsque",
      "station.previous": "Précédent",
      "station.next": "Suivant",
      "station.coreStation": "Station principale",
      "station.subStation": "Sous-station",
      "station.relatedCanvases": "Canvas associés",
      "station.relatedResources": "Ressources associées",
      "station.people": "Personnes à impliquer",
      "station.noEntryCriteria": "Aucun critère d'entrée listé.",
      "station.noExitCriteria": "Aucun critère de sortie listé.",
      "station.noLineTransitions": "Aucune transition de ligne n'est listée pour cette station.",
      "role.kicker": "Personnes à impliquer",
      "role.titlePrefix": "Guide des rôles pour",
      "role.columnStakeholder": "Partie prenante",
      "role.columnWhy": "Pourquoi elle compte",
      "role.columnRole": "Rôle",
      "role.columnResponsibilities": "Responsabilités",
      "role.noResponsibilities": "Aucune responsabilité de ressource spécifique",
      "resources.emptyCanvases": "Aucune ressource canvas n'est directement liée à cette station.",
      "resources.emptyOther": "Aucune ressource supplémentaire n'est directement liée à cette station.",
      "resources.kicker": "Ressources",
      "resources.titlePrefix": "Ressources pour",
      "resources.helper": "Sélectionnez une ressource de station dans le panneau de détails. Les ressources canvas ouvrent l'espace local de notes adhésives ; les autres ressources ouvrent des guides, exemples ou checklists.",
      "resources.select": "Sélectionner une ressource",
      "resources.emptySelect": "Aucune ressource de station",
      "resources.emptyStation": "Aucune ressource n'est directement liée à cette station dans le cycle sélectionné.",
      "resources.noExternalRenderer": "Aucun moteur de rendu canvas externe n'est configuré ; cette page utilise donc l'espace local intégré.",
      "resources.useWithAi": "Utiliser les ressources de la station avec l'IA",
      "resources.useWithAiHelp": "Ouvrez Ressources, sélectionnez un canvas ou un guide, puis copiez son Markdown ou JSON dans votre conversation IA.",
      "resources.helpsAnswer": "Aide à répondre",
      "resources.expectedOutcomes": "Résultats attendus",
      "resources.howToUse": "Comment l'utiliser",
      "resources.sourceContent": "Contenu source",
      "resources.source": "Source",
      "resources.details": "détails",
      "canvas.localWorkspace": "Espace canvas local",
      "canvas.focusSection": "Cibler la section",
      "canvas.showAll": "Tout afficher",
      "canvas.activeSection": "Section active",
      "canvas.selectSectionInstructions": "Sélectionnez une section avec le pointeur, ou placez-y le focus et appuyez sur Entrée ou Espace.",
      "canvas.exportMarkdown": "Exporter Markdown",
      "canvas.exportJson": "Exporter JSON",
      "canvas.importJson": "Importer JSON",
      "canvas.openCreator": "Ouvrir dans CanvasCreator",
      "canvas.markdownExported": "Markdown du canvas exporté.",
      "canvas.jsonExported": "JSON du canvas exporté.",
      "canvas.jsonImported": "JSON du canvas importé.",
      "canvas.invalidImport": "Modèle d'import/export canvas non valide",
      "canvas.removeNote": "Supprimer la note",
      "canvas.addStickyNote": "Ajouter une note",
      "category_canvas": "Canvas",
      "category_guideline": "Guide",
      "category_checklist": "Checklist",
      "ai.kicker": "Utiliser avec l'IA",
      "ai.titlePrefix": "Assistance IA pour",
      "ai.helper": "Utilisez l'IA pour faciliter la discussion de station, parcourir les ressources sélectionnées et transformer les notes de canvas ou constats de ressources en prochaines actions.",
      "ai.facilitate": "Faciliter la discussion de station",
      "ai.nextAction": "Décider la prochaine action",
      "ai.facilitateTitlePrefix": "Faciliter",
      "ai.nextActionTitlePrefix": "Prochaines actions pour",
      "ai.purpose": "Objectif",
      "ai.copyPrompt": "Copier le prompt",
      "ai.promptContext": "Contexte APIOps Cycles sélectionné",
      "ai.promptRoute": "Parcours",
      "ai.promptCycle": "Cycle",
      "ai.promptStation": "Station",
      "ai.promptStationPurpose": "Objectif de la station",
      "ai.promptResources": "Ressources de la station",
      "ai.promptCanvases": "Canvas de la station",
      "confluence.kicker": "Export Confluence",
      "confluence.title": "Modèles de publication",
      "confluence.helper": "Choisissez d'abord l'objectif, puis copiez le format adapté à la destination. Markdown convient aux dépôts de documentation et aux sites statiques. Confluence-wiki convient aux pages Confluence qui acceptent le balisage wiki.",
      "confluence.questionTemplate": "Modèle de questions",
      "confluence.questionTemplateTitle": "Modèle de questions à remplir",
      "confluence.questionTemplateHelp": "Utilisez-le pour recueillir les réponses et preuves de la station avec les questions de canvas et ressources associées.",
      "confluence.markdown": "Markdown",
      "confluence.confluenceWiki": "Confluence-wiki",
      "confluence.copyMarkdown": "Copier Markdown",
      "confluence.copyConfluenceWiki": "Copier Confluence-wiki",
      "actions.copy": "Copier",
      "actions.expandAll": "Tout développer",
      "actions.collapseAll": "Tout réduire",
      "actions.use": "Utiliser",
      "actions.copied": "Copié avec succès",
      "actions.expand": "▸",
      "actions.collapse": "▾",
      "confluence.cycleExport": "Export du cycle",
      "confluence.audience": "Public visé",
      "confluence.formatGuidance": "Guide de format",
      "confluence.formatGuidanceText": "Utilisez Markdown pour les dépôts de documentation et les sites statiques. Utilisez Confluence-wiki pour les pages Confluence qui acceptent le balisage wiki.",
      "data.kicker": "Données méthode",
      "data.title": "Surfaces d'intégration statiques",
      "data.helper": "Ces fichiers JSON sont publiés avec le site et peuvent être consommés par de futurs outils MCP, générateurs de documentation ou moteurs de rendu canvas externes.",
      "data.panelHelper": "Toutes les vues de l'espace de travail consomment le JSON généré sous /data. Aucune base de données ni persistance côté serveur n'est ajoutée.",
      "data.sourceDependency": "Dépendance source",
      "data.branch": "Branche",
      "data.localeSafe": "Compatible localisation",
      "data.localeSafeText": "La langue par défaut est {defaultLocale} ; les langues publiées sont {locales}.",
      "partners.kicker": "Communauté et partenaires",
      "partners.title": "Construit avec la communauté APIOps Cycles",
      "partners.description": "APIOps Cycles est une méthode ouverte. Les partenaires aident à la développer, l'utiliser et l'enseigner aux équipes dans le monde entier.",
      "footer.license": "Sous licence CC-BY-SA 4.0.",
      "footer.github": "Dépôt GitHub",
      "footer.community": "Événements communautaires et adhésion",
    },
    de: {
      "section.journeyCriteria": "Ablaufkriterien",
      "nav.workflows": "Workflows",
      "nav.data": "Daten",
      "nav.language": "Sprache",
      "nav.primary": "Hauptnavigation",
      "nav.licensing": "Lizenzierung",
      "nav.github": "GitHub",
      "nav.community": "Community",
      "nav.designSystem": "Designsystem",
      "nav.menu": "Menü",
      "controls.currentRoute": "Aktuelle Route",
      "controls.stakeholderInvolvement": "Stakeholder-Beteiligung",
      "controls.recommendedCycle": "Empfohlener Zyklus",
      "controls.currentStation": "Aktuelle Station",
      "controls.routeControls": "Routensteuerung",
      "controls.workspaceModes": "Arbeitsbereichsmodi",
      "controls.selectCycle": "Zyklus auswählen",
      "controls.selectStakeholder": "Stakeholder auswählen",
      "involvement.lead": "Lead",
      "involvement.core": "Kernrolle",
      "involvement.consulted": "Konsultiert",
      "views.map": "Metrokarte",
      "views.guide": "Rollenleitfaden",
      "views.canvases": "Ressourcen",
      "views.ai": "Mit KI nutzen",
      "views.confluence": "Confluence",
      "views.data": "Methodendaten",
      "map.kicker": "Ihre Route auf der Karte",
      "map.instructions": "Klicken Sie auf eine Station, um den ausgewählten Arbeitsbereich zu ändern. Die hervorgehobene Route zeigt den aktuellen Zyklus.",
      "map.linesTitle": "Metrolinien",
      "map.linesDescription": "Linien zeigen Entscheidungsstränge entlang des gemeinsamen APIOps-Rückgrats. Zyklen zeigen die Reise für ein Ziel.",
      "map.exportSvg": "SVG exportieren",
      "map.svgExported": "Metrokarte als SVG exportiert.",
      "map.instructionsSvg": "Klicken Sie auf einen Stationspunkt, um zu navigieren. Verwenden Sie die Zyklusauswahl, um die Route zu wechseln.",
      "map.ariaLabel": "APIOps Cycles Metrokarte",
      "map.zoneStrategic": "Strategisch",
      "map.zoneGovernance": "Governance",
      "map.zoneConsumer": "Nutzer",
      "map.zoneTechnical": "Technisch",
      "station.youAreHere": "Sie sind hier",
      "station.keyQuestions": "Schlüsselfragen",
      "station.whereNext": "Wohin kann ich als Nächstes gehen?",
      "station.before": "Vor dieser Station",
      "station.ready": "Bereit zum Verlassen, wenn",
      "station.previous": "Vorherige",
      "station.next": "Nächste",
      "station.coreStation": "Kernstation",
      "station.subStation": "Unterstation",
      "station.relatedCanvases": "Zugehörige Canvases",
      "station.relatedResources": "Zugehörige Ressourcen",
      "station.people": "Einzubeziehende Personen",
      "station.noEntryCriteria": "Keine Eintrittskriterien aufgeführt.",
      "station.noExitCriteria": "Keine Austrittskriterien aufgeführt.",
      "station.noLineTransitions": "Für diese Station sind keine Linienübergänge aufgeführt.",
      "role.kicker": "Einzubeziehende Personen",
      "role.titlePrefix": "Rollenleitfaden für",
      "role.columnStakeholder": "Stakeholder",
      "role.columnWhy": "Warum sie wichtig sind",
      "role.columnRole": "Rolle",
      "role.columnResponsibilities": "Verantwortlichkeiten",
      "role.noResponsibilities": "Keine spezifische Ressourcenverantwortung",
      "resources.emptyCanvases": "Mit dieser Station sind keine Canvas-Ressourcen direkt verknüpft.",
      "resources.emptyOther": "Mit dieser Station sind keine weiteren Ressourcen direkt verknüpft.",
      "resources.kicker": "Ressourcen",
      "resources.titlePrefix": "Ressourcen für",
      "resources.helper": "Wählen Sie eine Stationsressource im Detailbereich. Canvas-Ressourcen öffnen den lokalen Sticky-Note-Arbeitsbereich; andere Ressourcen öffnen Leitfäden, Beispiele oder Checklisten.",
      "resources.select": "Ressource auswählen",
      "resources.emptySelect": "Keine Stationsressourcen",
      "resources.emptyStation": "In diesem Zyklus sind keine Ressourcen direkt mit dieser Station verknüpft.",
      "resources.noExternalRenderer": "Es ist kein externer Canvas-Renderer konfiguriert, daher nutzt diese Seite den integrierten lokalen Arbeitsbereich.",
      "resources.useWithAi": "Stationsressourcen mit KI nutzen",
      "resources.useWithAiHelp": "Öffnen Sie Ressourcen, wählen Sie einen Canvas oder Leitfaden und kopieren Sie Markdown oder JSON in Ihr KI-Gespräch.",
      "resources.helpsAnswer": "Hilft bei der Beantwortung",
      "resources.expectedOutcomes": "Erwartete Ergebnisse",
      "resources.howToUse": "So verwenden Sie es",
      "resources.sourceContent": "Quellinhalt",
      "resources.source": "Quelle",
      "resources.details": "Details",
      "canvas.localWorkspace": "Lokaler Canvas-Arbeitsbereich",
      "canvas.focusSection": "Abschnitt fokussieren",
      "canvas.showAll": "Alle anzeigen",
      "canvas.activeSection": "Aktiver Abschnitt",
      "canvas.selectSectionInstructions": "Wählen Sie einen Abschnitt mit dem Zeiger aus oder fokussieren Sie ihn und drücken Sie die Eingabe- oder Leertaste.",
      "canvas.exportMarkdown": "Markdown exportieren",
      "canvas.exportJson": "JSON exportieren",
      "canvas.importJson": "JSON importieren",
      "canvas.openCreator": "In CanvasCreator öffnen",
      "canvas.markdownExported": "Canvas-Markdown exportiert.",
      "canvas.jsonExported": "Canvas-JSON exportiert.",
      "canvas.jsonImported": "Canvas-JSON importiert.",
      "canvas.invalidImport": "Ungültige Canvas-Import-/Exportvorlage",
      "canvas.removeNote": "Notiz entfernen",
      "canvas.addStickyNote": "Notiz hinzufügen",
      "category_canvas": "Canvas",
      "category_guideline": "Leitfaden",
      "category_checklist": "Checkliste",
      "ai.kicker": "Mit KI nutzen",
      "ai.titlePrefix": "KI-Unterstützung für",
      "ai.helper": "Nutzen Sie KI, um die Stationsdiskussion zu moderieren, ausgewählte Ressourcen durchzugehen und Canvas-Notizen oder Ressourcenerkenntnisse in nächste Schritte zu verwandeln.",
      "ai.facilitate": "Stationsdiskussion moderieren",
      "ai.nextAction": "Nächste Aktion entscheiden",
      "ai.facilitateTitlePrefix": "Moderieren",
      "ai.nextActionTitlePrefix": "Nächste Aktionen für",
      "ai.purpose": "Zweck",
      "ai.copyPrompt": "Prompt kopieren",
      "ai.promptContext": "Ausgewählter APIOps-Cycles-Kontext",
      "ai.promptRoute": "Route",
      "ai.promptCycle": "Zyklus",
      "ai.promptStation": "Station",
      "ai.promptStationPurpose": "Stationszweck",
      "ai.promptResources": "Stationsressourcen",
      "ai.promptCanvases": "Stations-Canvases",
      "confluence.kicker": "Confluence-Export",
      "confluence.title": "Publikationsvorlagen",
      "confluence.helper": "Wählen Sie zuerst den Zweck und kopieren Sie dann das passende Format. Markdown ist für Dokumentations-Repositories und statische Sites. Confluence-wiki ist für Confluence-Seiten, die Wiki-Markup akzeptieren.",
      "confluence.questionTemplate": "Fragenvorlage",
      "confluence.questionTemplateTitle": "Auszufüllende Fragenvorlage",
      "confluence.questionTemplateHelp": "Verwenden Sie dies, um Stationsantworten und Nachweise mit zugehörigen Canvas-Fragen und Ressourcen zu sammeln.",
      "confluence.markdown": "Markdown",
      "confluence.confluenceWiki": "Confluence-wiki",
      "confluence.copyMarkdown": "Markdown kopieren",
      "confluence.copyConfluenceWiki": "Confluence-wiki kopieren",
      "actions.copy": "Kopieren",
      "actions.expandAll": "Alle erweitern",
      "actions.collapseAll": "Alle reduzieren",
      "actions.use": "Nutzen",
      "actions.copied": "Erfolgreich kopiert",
      "actions.expand": "▸",
      "actions.collapse": "▾",
      "confluence.cycleExport": "Zyklusexport",
      "confluence.audience": "Zielgruppe",
      "confluence.formatGuidance": "Formatleitfaden",
      "confluence.formatGuidanceText": "Verwenden Sie Markdown für Dokumentations-Repositories und statische Sites. Verwenden Sie Confluence-wiki für Confluence-Seiten, die Wiki-Markup akzeptieren.",
      "data.kicker": "Methodendaten",
      "data.title": "Statische Integrationsflächen",
      "data.helper": "Diese JSON-Dateien werden mit der Site veröffentlicht und können von künftigen MCP-Tools, Dokumentationsgeneratoren oder externen Canvas-Renderern genutzt werden.",
      "data.panelHelper": "Alle Arbeitsbereichsansichten nutzen generiertes JSON unter /data. Es wird keine Datenbank oder serverseitige Persistenz eingeführt.",
      "data.sourceDependency": "Quellabhängigkeit",
      "data.branch": "Branch",
      "data.localeSafe": "Lokalisierungssicher",
      "data.localeSafeText": "Standardsprache ist {defaultLocale}; veröffentlichte Sprachen sind {locales}.",
      "partners.kicker": "Community und Partner",
      "partners.title": "Mit der APIOps Cycles Community entwickelt",
      "partners.description": "APIOps Cycles ist eine offene Methode. Partner helfen, sie zu entwickeln, einzusetzen und Teams weltweit zu vermitteln.",
      "footer.license": "Lizenziert unter CC-BY-SA 4.0.",
      "footer.github": "GitHub-Repository",
      "footer.community": "Community-Events und Beitritt",
    },
    pt: {
      "section.journeyCriteria": "Critérios do percurso",
      "nav.workflows": "Fluxos de trabalho",
      "nav.data": "Dados",
      "nav.language": "Idioma",
      "nav.primary": "Navegação principal",
      "nav.licensing": "Licenciamento",
      "nav.github": "GitHub",
      "nav.community": "Comunidade",
      "nav.designSystem": "Design system",
      "nav.menu": "Menu",
      "controls.currentRoute": "Rota atual",
      "controls.stakeholderInvolvement": "Envolvimento das partes interessadas",
      "controls.recommendedCycle": "Ciclo recomendado",
      "controls.currentStation": "Estação atual",
      "controls.routeControls": "Controles de rota",
      "controls.workspaceModes": "Modos do espaço de trabalho",
      "controls.selectCycle": "Selecionar ciclo",
      "controls.selectStakeholder": "Selecionar parte interessada",
      "involvement.lead": "Líder",
      "involvement.core": "Essencial",
      "involvement.consulted": "Consultado",
      "views.map": "Mapa do metrô",
      "views.guide": "Guia de papéis",
      "views.canvases": "Recursos",
      "views.ai": "Usar com IA",
      "views.confluence": "Confluence",
      "views.data": "Dados do método",
      "map.kicker": "Sua rota no mapa",
      "map.instructions": "Clique em uma estação para mudar o espaço de trabalho selecionado. A rota destacada mostra o ciclo atual.",
      "map.linesTitle": "Linhas de metrô",
      "map.linesDescription": "As linhas mostram trilhas de decisão no backbone APIOps compartilhado. Os ciclos mostram a jornada para um objetivo.",
      "map.exportSvg": "Exportar SVG",
      "map.svgExported": "SVG do mapa do metrô exportado.",
      "map.instructionsSvg": "Clique em qualquer ponto de estação para navegar. Use o seletor de ciclo para mudar a rota.",
      "map.ariaLabel": "Mapa do metrô APIOps Cycles",
      "map.zoneStrategic": "Estratégico",
      "map.zoneGovernance": "Governança",
      "map.zoneConsumer": "Consumidor",
      "map.zoneTechnical": "Técnico",
      "station.youAreHere": "Você está aqui",
      "station.keyQuestions": "Perguntas-chave",
      "station.whereNext": "Para onde posso ir agora?",
      "station.before": "Antes desta estação",
      "station.ready": "Pronto para sair quando",
      "station.previous": "Anterior",
      "station.next": "Próxima",
      "station.coreStation": "Estação principal",
      "station.subStation": "Subestação",
      "station.relatedCanvases": "Canvas relacionados",
      "station.relatedResources": "Recursos relacionados",
      "station.people": "Pessoas a envolver",
      "station.noEntryCriteria": "Nenhum critério de entrada listado.",
      "station.noExitCriteria": "Nenhum critério de saída listado.",
      "station.noLineTransitions": "Nenhuma transição de linha está listada para esta estação.",
      "role.kicker": "Pessoas a envolver",
      "role.titlePrefix": "Guia de papéis para",
      "role.columnStakeholder": "Parte interessada",
      "role.columnWhy": "Por que importa",
      "role.columnRole": "Papel",
      "role.columnResponsibilities": "Responsabilidades",
      "role.noResponsibilities": "Nenhuma responsabilidade específica por recursos",
      "resources.emptyCanvases": "Nenhum recurso de canvas está diretamente vinculado a esta estação.",
      "resources.emptyOther": "Nenhum recurso adicional está diretamente vinculado a esta estação.",
      "resources.kicker": "Recursos",
      "resources.titlePrefix": "Recursos para",
      "resources.helper": "Selecione um recurso da estação no painel de detalhes. Recursos de canvas abrem o espaço local de notas adesivas; outros recursos abrem orientações, exemplos ou checklists.",
      "resources.select": "Selecionar recurso",
      "resources.emptySelect": "Nenhum recurso de estação",
      "resources.emptyStation": "Nenhum recurso está diretamente vinculado a esta estação no ciclo selecionado.",
      "resources.noExternalRenderer": "Nenhum renderizador externo de canvas está configurado, então esta página usa o espaço local integrado.",
      "resources.useWithAi": "Usar recursos da estação com IA",
      "resources.useWithAiHelp": "Abra Recursos, selecione um canvas ou item de orientação e copie seu Markdown ou JSON para a conversa com IA.",
      "resources.helpsAnswer": "Ajuda a responder",
      "resources.expectedOutcomes": "Resultados esperados",
      "resources.howToUse": "Como usar",
      "resources.sourceContent": "Conteúdo de origem",
      "resources.source": "Fonte",
      "resources.details": "detalhes",
      "canvas.localWorkspace": "Espaço local de canvas",
      "canvas.focusSection": "Focar seção",
      "canvas.showAll": "Mostrar tudo",
      "canvas.activeSection": "Seção ativa",
      "canvas.selectSectionInstructions": "Selecione uma seção com o ponteiro ou foque-a e pressione Enter ou Espaço.",
      "canvas.exportMarkdown": "Exportar Markdown",
      "canvas.exportJson": "Exportar JSON",
      "canvas.importJson": "Importar JSON",
      "canvas.openCreator": "Abrir no CanvasCreator",
      "canvas.markdownExported": "Markdown do canvas exportado.",
      "canvas.jsonExported": "JSON do canvas exportado.",
      "canvas.jsonImported": "JSON do canvas importado.",
      "canvas.invalidImport": "Modelo de importação/exportação de canvas inválido",
      "canvas.removeNote": "Remover nota",
      "canvas.addStickyNote": "Adicionar nota",
      "category_canvas": "Canvas",
      "category_guideline": "Guia",
      "category_checklist": "Checklist",
      "ai.kicker": "Usar com IA",
      "ai.titlePrefix": "Assistência de IA para",
      "ai.helper": "Use IA para facilitar a conversa da estação, trabalhar com os recursos selecionados e transformar notas de canvas ou descobertas de recursos em próximas ações.",
      "ai.facilitate": "Facilitar discussão da estação",
      "ai.nextAction": "Decidir próxima ação",
      "ai.facilitateTitlePrefix": "Facilitar",
      "ai.nextActionTitlePrefix": "Próximas ações para",
      "ai.purpose": "Propósito",
      "ai.copyPrompt": "Copiar prompt",
      "ai.promptContext": "Contexto APIOps Cycles selecionado",
      "ai.promptRoute": "Rota",
      "ai.promptCycle": "Ciclo",
      "ai.promptStation": "Estação",
      "ai.promptStationPurpose": "Propósito da estação",
      "ai.promptResources": "Recursos da estação",
      "ai.promptCanvases": "Canvas da estação",
      "confluence.kicker": "Exportação Confluence",
      "confluence.title": "Modelos de publicação",
      "confluence.helper": "Escolha primeiro o objetivo e depois copie o formato adequado ao destino. Markdown é para repositórios de documentação e sites estáticos. Confluence-wiki é para páginas Confluence que aceitam marcação wiki.",
      "confluence.questionTemplate": "Modelo de perguntas",
      "confluence.questionTemplateTitle": "Modelo de perguntas para preencher",
      "confluence.questionTemplateHelp": "Use isto quando quiser coletar respostas e evidências da estação com perguntas de canvas e recursos relacionados.",
      "confluence.markdown": "Markdown",
      "confluence.confluenceWiki": "Confluence-wiki",
      "confluence.copyMarkdown": "Copiar Markdown",
      "confluence.copyConfluenceWiki": "Copiar Confluence-wiki",
      "actions.copy": "Copiar",
      "actions.expandAll": "Expandir tudo",
      "actions.collapseAll": "Recolher tudo",
      "actions.use": "Usar",
      "actions.copied": "Copiado com sucesso",
      "actions.expand": "▸",
      "actions.collapse": "▾",
      "confluence.cycleExport": "Exportação do ciclo",
      "confluence.audience": "Público-alvo",
      "confluence.formatGuidance": "Orientação de formato",
      "confluence.formatGuidanceText": "Use Markdown para repositórios de documentação e sites estáticos. Use Confluence-wiki para páginas Confluence que aceitam marcação wiki.",
      "data.kicker": "Dados do método",
      "data.title": "Superfícies de integração estáticas",
      "data.helper": "Estes arquivos JSON são publicados com o site e podem ser consumidos por futuras ferramentas MCP, geradores de documentação ou renderizadores externos de canvas.",
      "data.panelHelper": "Todas as visualizações do espaço de trabalho consomem JSON gerado em /data. Nenhum banco de dados ou persistência no servidor é introduzido.",
      "data.sourceDependency": "Dependência de origem",
      "data.branch": "Branch",
      "data.localeSafe": "Seguro para localização",
      "data.localeSafeText": "O idioma padrão é {defaultLocale}; os idiomas publicados são {locales}.",
      "partners.kicker": "Comunidade e parceiros",
      "partners.title": "Criado com a comunidade APIOps Cycles",
      "partners.description": "APIOps Cycles é um método aberto. Parceiros ajudam a desenvolvê-lo, usá-lo e ensiná-lo a equipes no mundo todo.",
      "footer.license": "Licenciado sob CC-BY-SA 4.0.",
      "footer.github": "Repositório GitHub",
      "footer.community": "Eventos da comunidade e participação",
    },
  };
  // Prefer labels maintained by method-data. `site.*` allows an explicit chrome
  // override; aliases reuse the existing semantic method labels for page headings.
  const methodLabelAliases = {
    "section.stations": ["stations"],
    "section.outcomes": ["outcomes"],
    "section.entryCriteria": ["entry_criteria", "entry_criteria_title"],
    "section.exitCriteria": ["exit_criteria", "exit_criteria_title"],
    "section.applyWork": ["apply_in_work"],
    "section.howToUse": ["how_it_works"],
    "controls.stakeholderInvolvement": ["stakeholder.involvement.title"],
    "involvement.lead": ["stakeholder.involvement.lead"],
    "involvement.core": ["stakeholder.involvement.core"],
    "involvement.consulted": ["stakeholder.involvement.consulted"],
    "map.linesTitle": ["lines.title"],
  };
  const methodLabel = (targetLocale, key) => {
    const labels = labelsByLocale[targetLocale] ?? {};
    return labels[`site.${key}`] ?? methodLabelAliases[key]?.map((alias) => labels[alias]).find(Boolean);
  };
  const localized = translations[locale] ?? {};
  const siteLabelAliases = {
    "entity.role": "role.kicker", "entity.resource": "resources.kicker",
    "section.people": "station.people", "section.resources": "station.relatedResources",
    "section.outcomes": "resources.expectedOutcomes", "section.howToUse": "resources.howToUse",
    "section.stakeholderGuides": "role.kicker", "section.roles": "role.kicker",
    "map.methodKicker": "map.kicker",
    "tools.reviewResources": "station.relatedResources",
    "resources.stationKicker": "resources.kicker", "resources.choose": "resources.select",
    "resources.expand": "actions.expandAll", "resources.collapse": "actions.collapseAll",
    "canvas.workWith": "canvas.localWorkspace", "canvas.addStickyNote": "canvas.addStickyNote",
    "exports.publishing": "confluence.kicker", "exports.title": "confluence.title",
    "exports.purpose": "confluence.questionTemplate",
    "clipboard.copied": "actions.copied", "prompt.copy": "ai.copyPrompt",
    "prompt.kicker": "ai.kicker", "prompt.title": "ai.facilitate",
  };
  const translatedSiteLabel = (key) => localized[key] ?? localized[siteLabelAliases[key]];
  const navigationTranslations = {
    fi: { "map.title": "Navigoi menetelmässä", "map.help": "Valitse asema, sykli tai sidosryhmän näkökulma tutustuaksesi menetelmään.", "controls.stakeholderInvolvement": "Näkökulma", "controls.goal": "Mitä haluat saavuttaa tänään?", "controls.selectGoal": "Valitse tavoite", "controls.resetContext": "Nollaa konteksti", "context.label": "Menetelmän nykyinen konteksti", "context.notSelected": "Ei valittu", "context.cycle": "Sykli", "context.here": "Tässä" },
    fr: { "map.title": "Naviguer dans la méthode", "map.help": "Sélectionnez une station, un cycle ou un point de vue pour explorer la méthode.", "controls.stakeholderInvolvement": "Voir en tant que", "controls.goal": "Que voulez-vous accomplir aujourd’hui ?", "controls.selectGoal": "Choisir un objectif", "controls.resetContext": "Réinitialiser le contexte", "context.label": "Contexte actuel de la méthode", "context.notSelected": "Non sélectionné", "context.cycle": "Cycle", "context.here": "Ici" },
    de: { "map.title": "Durch die Methode navigieren", "map.help": "Station, Zyklus oder Stakeholder-Perspektive auswählen, um die Methode zu erkunden.", "controls.stakeholderInvolvement": "Anzeigen als", "controls.goal": "Was möchten Sie heute erreichen?", "controls.selectGoal": "Ziel auswählen", "controls.resetContext": "Kontext zurücksetzen", "context.label": "Aktueller Methodenkontext", "context.notSelected": "Nicht ausgewählt", "context.cycle": "Zyklus", "context.here": "Hier" },
    pt: { "map.title": "Navegar pelo método", "map.help": "Selecione uma estação, ciclo ou perspectiva para explorar o método.", "controls.stakeholderInvolvement": "Ver como", "controls.goal": "O que deseja alcançar hoje?", "controls.selectGoal": "Selecionar objetivo", "controls.resetContext": "Redefinir contexto", "context.label": "Contexto atual do método", "context.notSelected": "Não selecionado", "context.cycle": "Ciclo", "context.here": "Aqui" },
  };
  if (locale === "en") {
    return Object.fromEntries(Object.entries(english).map(([key, value]) => {
      const sourceLabel = methodLabel("en", key);
      return [key, sourceLabel ?? translatedSiteLabel(key) ?? value];
    }));
  }
  return Object.fromEntries(Object.entries(english).flatMap(([key]) => {
    const sourceLabel = methodLabel(locale, key);
    const translated = navigationTranslations[locale]?.[key] ?? sourceLabel ?? translatedSiteLabel(key);
    return translated === undefined ? [] : [[key, translated]];
  }));
}

const cyclesRaw = readJson(path.join(methodRoot, "cycles.json")).cycles.items;
const stationsRaw = readJson(path.join(methodRoot, "stations.json"));
const resourcesRaw = readJson(path.join(methodRoot, "resources.json")).resources;
const criteriaSource = readJson(path.join(methodRoot, "criteria.json"));
const criteriaRaw = criteriaSource.criteria ?? criteriaSource ?? [];
const linesRaw = readJson(path.join(methodRoot, "lines.json")).lines.items ?? [];
const stakeholdersRaw = readJson(path.join(methodRoot, "stakeholders.json")).stakeholders ?? [];
const stationStakeholdersRaw = readJson(path.join(methodRoot, "station-stakeholders.json"));
const stationCriteriaRaw = readJson(path.join(methodRoot, "station-criteria.json"));
const canvasDataRaw = readJson(path.join(canvasRoot, "canvasData.json"));
const canvasLabelsRaw = readJson(path.join(canvasRoot, "localizedData.json"));
const labelsByLocale = Object.fromEntries(locales.map((locale) => [locale, readLabels(locale)]));

function catalogLabels(locale) {
  return Object.fromEntries(
    Object.entries(labelsByLocale[locale] ?? {}).filter(([key]) =>
      !key.startsWith("cycle.template.") && !key.startsWith("integration.template."),
    ),
  );
}

function t(locale, key) {
  if (!key) return "";
  return labelsByLocale[locale]?.[key] ?? labelsByLocale.en?.[key] ?? key;
}

function hasLabel(locale, key) {
  return Boolean(labelsByLocale[locale]?.[key] ?? labelsByLocale.en?.[key]);
}

function translateList(locale, list = []) {
  return list.map((item) => t(locale, item)).filter(Boolean);
}

function stationStepItems(station) {
  return station.how_it_works ?? station["how-it-works"] ?? [];
}

function readSnippet(locale, snippet) {
  if (!snippet) return { sourcePath: null, contentMarkdown: null };
  const localized = path.join(snippetRoot, locale, snippet);
  const fallback = path.join(snippetRoot, snippet);
  const sourcePath = existsSync(localized) ? localized : existsSync(fallback) ? fallback : null;
  if (!sourcePath) return { sourcePath: `src/snippets/${snippet}`, contentMarkdown: null };
  return {
    sourcePath: path.relative(sourceRoot, sourcePath).replaceAll("\\", "/"),
    contentMarkdown: readFileSync(sourcePath, "utf8"),
  };
}

function allStations() {
  return Object.values(stationsRaw)
    .flatMap((group) =>
      (group.items ?? []).map((station) => ({
        ...station,
        groupTitle: group.title,
        groupSlug: group.slug,
      })),
    )
    .sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
}

const stationsRawList = allStations();
const resourceById = Object.fromEntries(resourcesRaw.map((item) => [item.id, item]));
const stationById = Object.fromEntries(stationsRawList.map((item) => [item.id, item]));
const cycleById = Object.fromEntries(cyclesRaw.map((item) => [item.id, item]));
const criterionById = Object.fromEntries(criteriaRaw.map((item) => [item.id, item]));
const sourceStakeholderById = Object.fromEntries(stakeholdersRaw.map((item) => [item.id, item]));
const stationStakeholdersByCycle = stationStakeholdersRaw.stationStakeholdersByCycle ?? null;

function normalizeStakeholderId(sourceKey) {
  return sourceKey ?? "";
}

function translateStakeholder(locale, sourceKey, involvement = "") {
  const id = normalizeStakeholderId(sourceKey);
  const source = sourceStakeholderById[id];
  const titleKey = source?.title ?? `stakeholder.${id}.title`;
  const descriptionKey = source?.description ?? `stakeholder.${id}.description`;
  const title = t(locale, titleKey);
  const description = t(locale, descriptionKey);
  return {
    id,
    sourceKey,
    sourceStakeholderId: source?.id ?? id,
    title: title === titleKey ? id : title,
    description: description === descriptionKey ? "" : description,
    involvement,
  };
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stationStakeholderItems(cycleId, stationId) {
  if (stationStakeholdersByCycle) return stationStakeholdersByCycle[cycleId]?.[stationId] ?? [];
  return stationStakeholdersRaw[stationId] ?? [];
}

function stationStakeholders(locale, cycleId, stationId) {
  return stationStakeholderItems(cycleId, stationId)
    .map((item) => ({
      ...translateStakeholder(locale, item.stakeholder, item.involvement),
      responsibilities: (item.responsibilities ?? []).map((responsibility) => {
        const resource = resourceById[responsibility.resource];
        return {
          resourceId: responsibility.resource,
          resourceTitle: resource ? t(locale, resource.title) : responsibility.resource,
          canvasId: resource?.canvas ?? null,
          role: responsibility.role,
        };
      }),
    }))
    .filter((item) => item.id)
    .sort((a, b) => (involvementRank[a.involvement] ?? 9) - (involvementRank[b.involvement] ?? 9) || a.title.localeCompare(b.title));
}

function aggregateStationStakeholders(locale, stationId) {
  const items = stationStakeholdersByCycle
    ? Object.keys(stationStakeholdersByCycle).flatMap((cycleId) => stationStakeholders(locale, cycleId, stationId))
    : stationStakeholders(locale, "", stationId);
  const byId = new Map();
  for (const item of items) {
    const current = byId.get(item.id);
    if (!current || (involvementRank[item.involvement] ?? 9) < (involvementRank[current.involvement] ?? 9)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => (involvementRank[a.involvement] ?? 9) - (involvementRank[b.involvement] ?? 9) || a.title.localeCompare(b.title));
}

function translateCriterion(locale, id) {
  const criterion = criterionById[id];
  return {
    id,
    title: t(locale, `criterion.${id}`),
    description: criterion?.description ? t(locale, criterion.description) : t(locale, `criterion.${id}`),
  };
}

function translateResource(locale, resource) {
  const snippet = readSnippet(locale, resource.snippet);
  return {
    id: resource.id,
    slug: resource.slug,
    title: t(locale, resource.title),
    description: t(locale, resource.description),
    category: resource.category ?? "resource",
    icon: resource.icon ?? "",
    order: Number(resource.order ?? 999),
    outcomes: translateList(locale, resource.outcomes),
    steps: translateList(locale, resource.how_it_works?.steps),
    canvasId: resource.canvas ?? null,
    sourcePath: snippet.sourcePath,
    sourceUrl: resource.url ?? null,
    contentMarkdown: snippet.contentMarkdown,
    draft: resource.draft === "true" || resource.daft === "true",
  };
}

function translateLine(locale, line) {
  return {
    id: line.id,
    slug: line.slug,
    title: t(locale, line.title),
    description: t(locale, line.description),
    icon: line.icon ?? "",
    color: line.color,
    order: Number(line.order ?? 999),
    stations: line.stations ?? [],
  };
}

function translateStation(locale, station) {
  const questions = translateList(locale, [
    ...stationStepItems(station).map((step) => step.step),
    station.apply_in_work,
    station.why_it_matters,
  ]);
  const criteria = stationCriteriaRaw[station.id] ?? station.stationCriteria ?? [];
  return {
    id: station.id,
    slug: station.slug,
    icon: station.icon ?? "",
    title: t(locale, station.title),
    description: t(locale, station.description),
    whyItMatters: t(locale, station.why_it_matters),
    applyInWork: t(locale, station.apply_in_work),
    group: t(locale, station.groupTitle),
    lifecycleStage: station.lifecycleStage ?? station.type ?? "supporting",
    outcomes: translateList(locale, station.outcomes),
    steps: stationStepItems(station).map((step) => ({
      text: t(locale, step.step),
      resourceId: step.resource,
      resourceTitle: step.resource ? t(locale, resourceById[step.resource]?.title) : "",
      canvasId: step.resource ? resourceById[step.resource]?.canvas ?? null : null,
    })),
    questions,
    criteria,
    criteriaDetails: criteria.map((id) => translateCriterion(locale, id)),
    stakeholders: aggregateStationStakeholders(locale, station.id),
    evidence: station.expectedEvidenceTags ?? [],
  };
}

function cycleStationLabelKey(cycleId, stationId, field) {
  return `cycle.${cycleId}.station.${stationId}.${field}`;
}

function translateCycleStation(locale, cycle, stationId, index) {
  const station = stationById[stationId];
  const titleKey = cycle.stationLabels?.[stationId] ?? cycleStationLabelKey(cycle.id, stationId, "title");
  const descriptionKey = cycle.stationDescriptions?.[stationId] ?? cycleStationLabelKey(cycle.id, stationId, "description");
  const whyKey = cycleStationLabelKey(cycle.id, stationId, "why_it_matters");
  const applyKey = cycleStationLabelKey(cycle.id, stationId, "apply_in_work");
  const outcomeKeys = station?.outcomes?.map((key) => key.replace(`station.${stationId}.`, `cycle.${cycle.id}.station.${stationId}.`)) ?? [];
  const stepItems = stationStepItems(station ?? {}).map((step) => ({
    ...step,
    step: step.step?.replace(`station.${stationId}.`, `cycle.${cycle.id}.station.${stationId}.`),
  }));
  const steps = stepItems.map((step) => ({
    text: hasLabel(locale, step.step) ? t(locale, step.step) : t(locale, step.step?.replace(`cycle.${cycle.id}.station.${stationId}.`, `station.${stationId}.`)),
    resourceId: step.resource,
    resourceTitle: step.resource ? t(locale, resourceById[step.resource]?.title) : "",
    canvasId: step.resource ? resourceById[step.resource]?.canvas ?? null : null,
  })).filter((step) => step.text);
  const stakeholders = stationStakeholders(locale, cycle.id, stationId);
  const responsibilityResourceIds = stakeholders.flatMap((stakeholder) =>
    (stakeholder.responsibilities ?? []).map((responsibility) => responsibility.resourceId),
  );
  const resources = (cycle.recommendedResources?.[stationId] ?? [])
    .concat(responsibilityResourceIds)
    .filter((id, index, items) => items.indexOf(id) === index)
    .map((id) => resourceById[id])
    .filter(Boolean)
    .map((resource) => translateResource(locale, resource));
  const stationCriteria = stationCriteriaRaw[stationId] ?? station?.stationCriteria ?? [];
  const translatedOutcomes = outcomeKeys.map((key, outcomeIndex) => {
    const fallback = station?.outcomes?.[outcomeIndex];
    return hasLabel(locale, key) ? t(locale, key) : t(locale, fallback);
  }).filter(Boolean);
  const whyItMatters = hasLabel(locale, whyKey) ? t(locale, whyKey) : t(locale, station?.why_it_matters);
  const applyInWork = hasLabel(locale, applyKey) ? t(locale, applyKey) : t(locale, station?.apply_in_work);
  const questions = translateList(locale, [
    ...stepItems.map((step) => step.step),
    applyKey,
    whyKey,
  ]).filter((text) => !text.startsWith(`cycle.${cycle.id}.station.${stationId}.`));

  return {
    index: index + 1,
    id: stationId,
    slug: station?.slug,
    icon: station?.icon ?? "",
    title: t(locale, titleKey),
    description: t(locale, descriptionKey),
    whyItMatters,
    applyInWork,
    outcomes: translatedOutcomes.length ? translatedOutcomes : translateList(locale, station?.outcomes),
    steps,
    questions: questions.length ? questions : translateList(locale, [
      ...stationStepItems(station ?? {}).map((step) => step.step),
      station?.apply_in_work,
      station?.why_it_matters,
    ]),
    criteria: stationCriteria,
    criteriaDetails: stationCriteria.map((id) => translateCriterion(locale, id)),
    baseTitle: station ? t(locale, station.title) : stationId,
    group: station ? t(locale, station.groupTitle) : "",
    lifecycleStage: station?.lifecycleStage ?? station?.type ?? "supporting",
    stakeholders,
    resources,
    evidence: station?.expectedEvidenceTags ?? [],
  };
}

function translateCycle(locale, cycle) {
  const audienceStakeholders = uniqueBy(
    cycle.stations.flatMap((stationId) =>
      stationStakeholders(locale, cycle.id, stationId)
        .filter((item) => item.involvement === "lead" || item.involvement === "core"),
    ),
    (item) => item.id,
  );
  const questionnaireResources = cycle.stations
    .flatMap((stationId) =>
      stationStakeholders(locale, cycle.id, stationId).flatMap((stakeholder) =>
        (stakeholder.responsibilities ?? [])
          .filter((responsibility) => responsibility.role === "suggested-answer-owner")
          .map((responsibility) => ({ stationId, stakeholder, responsibility })),
      ),
    )
    .map((item) => {
      const resource = resourceById[item.responsibility.resourceId];
      const station = stationById[item.stationId];
      return {
        stationId: item.stationId,
        stationTitle: station ? t(locale, cycle.stationLabels?.[item.stationId] ?? station.title) : item.stationId,
        resourceId: item.responsibility.resourceId,
        resourceTitle: resource ? t(locale, resource.title) : item.responsibility.resourceId,
        canvasId: resource?.canvas ?? null,
        suggestedAnswerOwner: item.stakeholder,
      };
    })
    .filter((item) => item.resourceId);
  return {
    id: cycle.id,
    slug: cycle.slug,
    title: t(locale, cycle.title),
    description: t(locale, cycle.description),
    purpose: t(locale, cycle.purpose),
    audiences: translateList(locale, cycle.audiences),
    audienceStakeholders,
    entryCriteria: cycle.entryCriteria ?? [],
    exitCriteria: cycle.exitCriteria ?? [],
    entryCriteriaDetails: (cycle.entryCriteria ?? []).map((id) => translateCriterion(locale, id)),
    exitCriteriaDetails: (cycle.exitCriteria ?? []).map((id) => translateCriterion(locale, id)),
    questionnaireResources,
    stations: cycle.stations.map((stationId, index) => translateCycleStation(locale, cycle, stationId, index)),
  };
}

function canvasTitle(locale, canvasId) {
  return canvasLabelsRaw[locale]?.[canvasId]?.title ?? canvasLabelsRaw.en?.[canvasId]?.title ?? canvasId;
}

function translateCanvas(locale, canvasId, canvas) {
  const labels = canvasLabelsRaw[locale]?.[canvasId] ?? canvasLabelsRaw.en?.[canvasId] ?? {};
  const metadata = methodEngine.buildCanvasMetadata(canvasId, locale);
  const metadataSections = new Map(metadata.sections.map((section) => [section.id, section]));
  const footer = labels.footer ?? canvas.footer ?? canvas.metadata?.footer ?? metadata.footer ?? "";
  const importExportTemplate = methodEngine.buildCanvasTemplate(canvasId, locale);
  return {
    id: canvasId,
    title: labels.title ?? canvasId,
    purpose: labels.purpose ?? "",
    howToUse: labels.howToUse ?? "",
    layout: canvas.layout,
    metadata: canvas.metadata,
    footer,
    canvasCreatorUrl: methodEngine.getCanvasCreatorUrl(canvasId, locale),
    importExportTemplate: {
      ...importExportTemplate,
      footer,
    },
    sections: canvas.sections
      .map((section) => {
        const sectionLabels = labels.sections?.[section.id] ?? {};
        const metadataSection = metadataSections.get(section.id);
        return {
          id: section.id,
          title: sectionLabels.section ?? section.id,
          description: sectionLabels.description ?? "",
          gridPosition: section.gridPosition,
          fillOrder: section.fillOrder,
          highlight: Boolean(section.highlight),
          journeySteps: Boolean(section.journeySteps),
          defaultNoteColor: metadataSection?.defaultNoteColor ?? "#FFF399",
          defaultNoteIntent: metadataSection?.defaultNoteIntent ?? "default",
        };
      })
      .sort((a, b) => Number(a.fillOrder ?? 999) - Number(b.fillOrder ?? 999)),
  };
}

function allStakeholders(locale) {
  return stakeholdersRaw
    .map((stakeholder) => translateStakeholder(locale, stakeholder.id))
    .filter((item) => item.id)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function routeProfiles(locale) {
  const stakeholderIds = new Set(
    cyclesRaw.flatMap((cycle) =>
      cycle.stations.flatMap((stationId) =>
        stationStakeholders(locale, cycle.id, stationId)
          .filter((stakeholder) => stakeholder.involvement === "lead" || stakeholder.involvement === "core")
          .map((stakeholder) => stakeholder.id),
      ),
    ),
  );
  return [...stakeholderIds].map((stakeholderId) => {
    const stakeholder = translateStakeholder(locale, stakeholderId);
    const cycles = cyclesRaw.filter((cycle) =>
      cycle.stations.some((stationId) =>
        stationStakeholders(locale, cycle.id, stationId).some((item) => item.id === stakeholderId),
      ),
    );
    const stationIds = uniqueBy(
      cycles.flatMap((cycle) =>
        cycle.stations.filter((stationId) =>
          stationStakeholders(locale, cycle.id, stationId).some((item) => item.id === stakeholderId),
        ),
      ),
      (id) => id,
    );
    const effectiveStationIds = stationIds.length > 0 ? stationIds : cycles.flatMap((cycle) => cycle.stations.slice(0, 1));
    const resources = uniqueBy(
      cycles.flatMap((cycle) =>
        effectiveStationIds.flatMap((stationId) => [
          ...(cycle.recommendedResources?.[stationId] ?? []),
          ...stationStakeholders(locale, cycle.id, stationId)
            .filter((item) => item.id === stakeholderId)
            .flatMap((item) => (item.responsibilities ?? []).map((responsibility) => responsibility.resourceId)),
        ]),
      ),
      (id) => id,
    )
      .map((id) => resourceById[id])
      .filter(Boolean);
    const canvases = uniqueBy(
      resources
        .filter((resource) => resource.canvas && canvasDataRaw[resource.canvas])
        .map((resource) => ({ id: resource.canvas, title: canvasTitle(locale, resource.canvas) })),
      (canvas) => canvas.id,
    );
    const stations = effectiveStationIds
      .filter((id) => stationById[id])
      .map((id) => ({
        id,
        title: t(locale, stationById[id].title),
        description: t(locale, stationById[id].description),
      }));
    const decisions = uniqueBy(
      effectiveStationIds.flatMap((id) => translateStation(locale, stationById[id])?.questions ?? []),
      (question) => question,
    ).slice(0, 6);
    const outputs = uniqueBy(
      effectiveStationIds.flatMap((id) => [
        ...(translateStation(locale, stationById[id])?.outcomes ?? []),
        ...(translateStation(locale, stationById[id])?.evidence ?? []),
      ]),
      (output) => output,
    ).slice(0, 8);
    return {
      id: stakeholderId,
      stakeholderId,
      title: stakeholder.title,
      summary: stakeholder.description || `${stakeholder.title} guided path`,
      stakeholder,
      cycles: cycles.map((cycle) => ({
        id: cycle.id,
        title: t(locale, cycle.title),
        description: t(locale, cycle.description),
      })),
      stations,
      canvases,
      decisions,
      outputs,
      recommendedResources: resources.slice(0, 10).map((resource) => translateResource(locale, resource)),
      promptIds: [
        `${stakeholderId}:facilitate-station`,
        `${stakeholderId}:use-resources`,
        `${stakeholderId}:next-actions`,
      ],
    };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

function promptPacks(locale) {
  return routeProfiles(locale).flatMap((route) => {
    const stationList = route.stations.map((station) => station.title).join(", ");
    const canvasList = route.canvases.map((canvas) => canvas.title).join(", ");
    const context = `Stakeholder: ${route.title}\nCycles: ${route.cycles.map((cycle) => cycle.title).join(", ")}\nStations: ${stationList}\nResources and canvases: ${canvasList}`;
    return [
      {
        id: `${route.id}:facilitate-station`,
        routeId: route.id,
        title: `Facilitate a station with ${route.title}`,
        mode: "facilitate-station",
        prompt: `${context}\n\nAct as an APIOps Cycles facilitator. Use the selected station questions, entry criteria, exit criteria, stakeholders, and related resources to guide the discussion. Produce decisions, evidence gaps, and next steps.`,
      },
      {
        id: `${route.id}:use-resources`,
        routeId: route.id,
        title: `Use station resources with ${route.title}`,
        mode: "use-resources",
        prompt: `${context}\n\nHelp the team use the recommended APIOps Cycles resources. For canvases, ask for evidence section by section and propose sticky notes. For checklists or guidelines, summarize what to review, what evidence is missing, and who should answer.`,
      },
      {
        id: `${route.id}:next-actions`,
        routeId: route.id,
        title: `Generate next actions for ${route.title}`,
        mode: "next-actions",
        prompt: `${context}\n\nGenerate practical next actions, owners, evidence to collect, related resources to use, and suggested next stations. Keep the output suitable for Markdown or Confluence.`,
      },
    ];
  });
}

function renderCycleQuestionMarkdown(locale, cycle) {
  const lines = [
    `# ${cycle.title} question template`,
    "",
    cycle.description,
    "",
    "Use this template to gather answers and evidence station by station. Canvas section prompts are listed first, followed by other related resources.",
    "",
  ];
  for (const station of cycle.stations) {
    lines.push(`## ${station.index}. ${station.title}`, "", station.description, "");
    const canvasResources = (station.resources ?? []).filter((resource) => resource.canvasId && canvasDataRaw[resource.canvasId]);
    const otherResources = (station.resources ?? []).filter((resource) => !resource.canvasId);
    if (canvasResources.length) {
      lines.push("### Canvas questions");
      for (const resource of canvasResources) {
        const canvas = translateCanvas(locale, resource.canvasId, canvasDataRaw[resource.canvasId]);
        lines.push(`#### ${resource.title}`);
        if (canvas.purpose) lines.push(canvas.purpose);
        for (const section of canvas.sections ?? []) {
          const prompt = section.description || section.title;
          if (prompt) lines.push(`- **${section.title}**: ${prompt}`);
        }
        lines.push("");
      }
    } else if (station.questions?.length) {
      lines.push("### Station questions");
      for (const question of station.questions) lines.push(`- ${question}`);
      lines.push("");
    }
    const entry = station.criteriaDetails?.flatMap((criterion) => criterion.entry ?? []) ?? [];
    if (entry.length) {
      lines.push("### Before this station");
      for (const criterion of entry) lines.push(`- [ ] ${criterion}`);
      lines.push("");
    }
    const exit = station.criteriaDetails?.flatMap((criterion) => criterion.exit ?? []) ?? [];
    if (exit.length) {
      lines.push("### Ready to leave when");
      for (const criterion of exit) lines.push(`- [ ] ${criterion}`);
      lines.push("");
    }
    if (otherResources.length) {
      lines.push("### Other related resources");
      for (const resource of otherResources) {
        lines.push(`- **${resource.title}**${resource.description ? `: ${resource.description}` : ""}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}

function renderCycleQuestionConfluenceWiki(locale, cycle) {
  const lines = [
    `h1. ${cycle.title} question template`,
    "",
    cycle.description,
    "",
    "Use this template to gather answers and evidence station by station. Canvas section prompts are listed first, followed by other related resources.",
    "",
  ];
  for (const station of cycle.stations) {
    lines.push(`h2. ${station.index}. ${station.title}`, "", station.description, "");
    const canvasResources = (station.resources ?? []).filter((resource) => resource.canvasId && canvasDataRaw[resource.canvasId]);
    const otherResources = (station.resources ?? []).filter((resource) => !resource.canvasId);
    if (canvasResources.length) {
      lines.push("h3. Canvas questions");
      for (const resource of canvasResources) {
        const canvas = translateCanvas(locale, resource.canvasId, canvasDataRaw[resource.canvasId]);
        lines.push(`h4. ${resource.title}`);
        if (canvas.purpose) lines.push(canvas.purpose);
        for (const section of canvas.sections ?? []) {
          const prompt = section.description || section.title;
          if (prompt) lines.push(`* *${section.title}*: ${prompt}`);
        }
        lines.push("");
      }
    } else if (station.questions?.length) {
      lines.push("h3. Station questions");
      for (const question of station.questions) lines.push(`* ${question}`);
      lines.push("");
    }
    const entry = station.criteriaDetails?.flatMap((criterion) => criterion.entry ?? []) ?? [];
    if (entry.length) {
      lines.push("h3. Before this station");
      for (const criterion of entry) lines.push(`* [ ] ${criterion}`);
      lines.push("");
    }
    const exit = station.criteriaDetails?.flatMap((criterion) => criterion.exit ?? []) ?? [];
    if (exit.length) {
      lines.push("h3. Ready to leave when");
      for (const criterion of exit) lines.push(`* [ ] ${criterion}`);
      lines.push("");
    }
    if (otherResources.length) {
      lines.push("h3. Other related resources");
      for (const resource of otherResources) {
        lines.push(`* *${resource.title}*${resource.description ? `: ${resource.description}` : ""}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}

function exportTemplates(locale) {
  return cyclesRaw.flatMap((rawCycle) => {
    const cycle = translateCycle(locale, rawCycle);
    const cycleId = rawCycle.id;
    return [
      {
        id: `${cycleId}:question-template-markdown`,
        cycleId,
        kind: "questions",
        format: "markdown",
        title: `${cycle.title} question template Markdown`,
        body: renderCycleQuestionMarkdown(locale, cycle),
      },
      {
        id: `${cycleId}:question-template-confluence-wiki`,
        cycleId,
        kind: "questions",
        format: "confluence-wiki",
        title: `${cycle.title} question template Confluence wiki`,
        body: renderCycleQuestionConfluenceWiki(locale, cycle),
      },
    ];
  });
}

let sourceCommit = "unknown";
try {
  sourceCommit = execFileSync(
    "git",
    ["-c", `safe.directory=${sourceRoot}`, "-C", sourceRoot, "rev-parse", "HEAD"],
    { encoding: "utf8" },
  ).trim();
} catch {}

const source = {
  repository: "https://github.com/APIOpsCycles/apiops-cycles-method-data",
  commit: sourceCommit,
};

const catalog = {
  source,
  locales,
  defaultLocale: "en",
  generatedAt: new Date().toISOString(),
  translations: Object.fromEntries(
    locales.map((locale) => [
      locale,
      {
        labels: catalogLabels(locale),
        cycles: cyclesRaw.map((cycle) => translateCycle(locale, cycle)),
        lines: linesRaw
          .map((line) => translateLine(locale, line))
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
        stations: stationsRawList.map((station) => translateStation(locale, station)),
        stakeholders: allStakeholders(locale),
        routeProfiles: routeProfiles(locale),
        resources: resourcesRaw
          .map((resource) => translateResource(locale, resource))
          .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
        criteria: criteriaRaw.map((criterion) => ({
          ...translateCriterion(locale, criterion.id),
          category: criterion.category ?? "",
        })),
      },
    ]),
  ),
};

const routeIndex = {
  source,
  locales,
  defaultLocale: "en",
  generatedAt: catalog.generatedAt,
  translations: Object.fromEntries(
    locales.map((locale) => {
      const data = catalog.translations[locale];
      return [
        locale,
        {
          routeProfiles: data.routeProfiles.map((route) => ({
            id: route.id,
            stakeholderId: route.stakeholderId,
            title: route.title,
            summary: route.summary,
          })),
          lines: data.lines.map((line) => ({
            id: line.id,
            slug: line.slug,
            title: line.title,
            description: line.description,
            icon: line.icon,
            color: line.color,
            stations: line.stations,
          })),
          cycles: data.cycles.map((cycle) => ({
            id: cycle.id,
            slug: cycle.slug,
            title: cycle.title,
            description: cycle.description,
            stations: cycle.stations.map((station) => ({
              id: station.id,
              title: station.title,
              description: station.description,
            })),
          })),
          stations: data.stations.map((station) => ({
            id: station.id,
            title: station.title,
            description: station.description,
          })),
        },
      ];
    }),
  ),
};

const canvasManifest = {
  source,
  locales,
  defaultLocale: "en",
  translations: Object.fromEntries(
    locales.map((locale) => [
      locale,
      Object.fromEntries(
        Object.entries(canvasDataRaw).map(([canvasId, canvas]) => [
          canvasId,
          translateCanvas(locale, canvasId, canvas),
        ]),
      ),
    ]),
  ),
};

const prompts = {
  source,
  locales,
  defaultLocale: "en",
  translations: Object.fromEntries(locales.map((locale) => [locale, promptPacks(locale)])),
};

const exportsData = {
  source,
  locales,
  defaultLocale: "en",
  translations: Object.fromEntries(locales.map((locale) => [locale, exportTemplates(locale)])),
};

const siteLabelsData = {
  source,
  locales,
  defaultLocale: "en",
  translations: Object.fromEntries(locales.map((locale) => [locale, siteLabels(locale)])),
};

const partners = {
  source,
  items: existsSync(partnerDataFile)
    ? readJson(partnerDataFile).map((partner) => ({
        ...partner,
        logo: partner.logo === "/favicon.svg" ? "/design-system/favicons/favicon.svg" : partner.logo,
      }))
    : [],
};

const announcement = existsSync(announcementFile)
  ? readJson(announcementFile)
  : {
      id: "announcement_v3_live_2026_07_16d",
      href: "#community",
      defaultLocale: "en",
      translations: {
        en: {
          message: "Version 2.0 is live with faster loading times!",
          linkLabel: "See what's new",
          dismissLabel: "Dismiss announcement",
        },
      },
    };

const mcpManifest = {
  source,
  version: 1,
  description: "Static APIOps Cycles manifest for a future MCP server.",
  dataFiles: [
    "/data/route-index.json",
    "/data/partners.json",
    "/data/announcement.json",
    ...locales.flatMap((locale) => [
      `/data/site-labels.${locale}.json`,
      `/data/method-catalog.${locale}.json`,
      `/data/canvas-manifest.${locale}.json`,
      `/data/prompt-packs.${locale}.json`,
      `/data/export-templates.${locale}.json`,
    ]),
  ],
  tools: [
    "list_cycles",
    "get_cycle",
    "get_station",
    "get_canvas",
    "suggest_next_step",
    "generate_prompt",
    "render_export",
  ],
  identifiers: {
    cycles: cyclesRaw.map((cycle) => cycle.id),
    stations: stationsRawList.map((station) => station.id),
    canvases: Object.keys(canvasDataRaw),
    stakeholders: allStakeholders("en").map((stakeholder) => stakeholder.id),
    routeProfiles: routeProfiles("en").map((route) => route.id),
  },
};

function validate() {
  const englishLabelKeys = Object.keys(siteLabelsData.translations.en);
  const methodChromeKeys = Object.keys(labelsByLocale.en).filter((key) =>
    key.startsWith("criterion.") || ["stations", "outcomes", "how_it_works", "apply_in_work", "entry_criteria", "exit_criteria"].includes(key),
  );
  for (const locale of locales) {
    const missingMethodKeys = methodChromeKeys.filter((key) => labelsByLocale[locale]?.[key] === undefined);
    if (missingMethodKeys.length) console.warn(`[method-labels] ${locale}: missing ${missingMethodKeys.length} key(s): ${missingMethodKeys.join(", ")}`);
    const missing = englishLabelKeys.filter((key) => siteLabelsData.translations[locale][key] === undefined);
    if (missing.length) console.warn(`[labels] ${locale}: missing ${missing.length} key(s), using English build-time fallback: ${missing.join(", ")}`);
  }
  const cycleIds = new Set(cyclesRaw.map((cycle) => cycle.id));
  const stationIds = new Set(stationsRawList.map((station) => station.id));
  const resourceIds = new Set(resourcesRaw.map((resource) => resource.id));
  const criterionIds = new Set(criteriaRaw.map((criterion) => criterion.id));
  const stakeholderIds = new Set(stakeholdersRaw.map((stakeholder) => stakeholder.id));
  const publicResourceById = new Map(
    resourcesRaw
      .filter((resource) => resource.draft !== "true" && resource.daft !== "true")
      .map((resource) => [resource.id, resource]),
  );
  const publicResourceRoutes = new Set();
  for (const resource of publicResourceById.values()) {
    if (!resource.slug?.startsWith("resources/") || resource.slug === "resources/") {
      throw new Error(`Public resource ${resource.id} has no Astro resource route: ${resource.slug ?? "(missing slug)"}`);
    }
    const href = `/${resource.slug}`;
    if (publicResourceRoutes.has(href)) throw new Error(`Duplicate public resource Astro route ${href}`);
    publicResourceRoutes.add(href);
  }
  const invalidStepReferences = [];
  for (const station of stationsRawList) {
    for (const step of stationStepItems(station)) {
      if (!step.resource) continue;
      const resource = publicResourceById.get(step.resource);
      const href = resource ? `/${resource.slug}` : null;
      if (!resource || !publicResourceRoutes.has(href)) invalidStepReferences.push(`${station.id} -> ${step.resource}`);
    }
  }
  if (invalidStepReferences.length) {
    console.warn(`[resource-routes] ${invalidStepReferences.length} station step reference(s) do not resolve to a public Astro route: ${invalidStepReferences.join(", ")}`);
  }
  for (const cycle of cyclesRaw) {
    if (!cycleIds.has(cycle.id)) throw new Error(`Missing cycle ${cycle.id}`);
    for (const stationId of cycle.stations ?? []) if (!stationIds.has(stationId)) throw new Error(`Missing station ${stationId}`);
  }
  const stakeholderGraph = stationStakeholdersByCycle ?? { default: stationStakeholdersRaw };
  for (const [cycleId, stations] of Object.entries(stakeholderGraph)) {
    if (cycleId !== "default" && !cycleIds.has(cycleId)) throw new Error(`Missing station stakeholder cycle ${cycleId}`);
    for (const [stationId, items] of Object.entries(stations)) {
      if (!stationIds.has(stationId)) throw new Error(`Missing station stakeholder station ${stationId}`);
      for (const item of items) {
        const id = normalizeStakeholderId(item.stakeholder);
        if (!stakeholderIds.has(id)) throw new Error(`Missing station stakeholder ${id}`);
        for (const responsibility of item.responsibilities ?? []) {
          if (!resourceIds.has(responsibility.resource)) throw new Error(`Missing stakeholder responsibility resource ${responsibility.resource}`);
        }
      }
    }
  }
  for (const [stationId, criteria] of Object.entries(stationCriteriaRaw)) {
    if (!stationIds.has(stationId)) throw new Error(`Missing station criteria station ${stationId}`);
    for (const id of criteria) if (!criterionIds.has(id)) throw new Error(`Missing criterion ${id}`);
  }
}

validate();
mkdirSync(buildDataRoot, { recursive: true });
mkdirSync(publicDataRoot, { recursive: true });
copyMethodAsset(
  path.join(assetRoot, "apiops-cycles-logo-dark.svg"),
  path.join(publicAssetRoot, "apiops-cycles-logo-dark.svg"),
);
copyMethodAsset(
  path.join(assetRoot, "apiops-cycles-logo-white.svg"),
  path.join(publicAssetRoot, "apiops-cycles-logo-white.svg"),
);
copyBrandOverrides();
for (const partner of partners.items) copyPartnerAsset(partner.logo);
writeBuildArtifact("route-index.json", routeIndex);
for (const locale of locales) {
  writeBuildArtifact(`site-labels.${locale}.json`, {
    ...siteLabelsData,
    translations: { [locale]: siteLabelsData.translations[locale] },
  });
  writeBuildArtifact(`method-catalog.${locale}.json`, {
    ...catalog,
    translations: { [locale]: catalog.translations[locale] },
  });
  writeBuildArtifact(`canvas-manifest.${locale}.json`, {
    ...canvasManifest,
    translations: { [locale]: canvasManifest.translations[locale] },
  });
  writeBuildArtifact(`prompt-packs.${locale}.json`, {
    ...prompts,
    translations: { [locale]: prompts.translations[locale] },
  });
  writeBuildArtifact(`export-templates.${locale}.json`, {
    ...exportsData,
    translations: { [locale]: exportsData.translations[locale] },
  });
}
writeBuildArtifact("partners.json", partners);
writeBuildArtifact("announcement.json", announcement);
writeBuildArtifact("mcp-method-manifest.json", mcpManifest);

// These files form the deliberate, URL-addressable method-data integration surface.
writePublicArtifact("route-index.json", routeIndex);
for (const locale of locales) {
  writePublicArtifact(`site-labels.${locale}.json`, {
    ...siteLabelsData,
    translations: { [locale]: siteLabelsData.translations[locale] },
  });
  writePublicArtifact(`method-catalog.${locale}.json`, {
    ...catalog,
    translations: { [locale]: catalog.translations[locale] },
  });
  writePublicArtifact(`canvas-manifest.${locale}.json`, {
    ...canvasManifest,
    translations: { [locale]: canvasManifest.translations[locale] },
  });
  writePublicArtifact(`prompt-packs.${locale}.json`, {
    ...prompts,
    translations: { [locale]: prompts.translations[locale] },
  });
  writePublicArtifact(`export-templates.${locale}.json`, {
    ...exportsData,
    translations: { [locale]: exportsData.translations[locale] },
  });
}
writePublicArtifact("partners.json", partners);
writePublicArtifact("announcement.json", announcement);
writePublicArtifact("mcp-method-manifest.json", mcpManifest);

const published = readdirSync(publicDataRoot).filter((name) => name.endsWith(".json"));
console.log(`Synced APIOps Cycles artifacts from ${sourceRoot}`);
console.log(`Published ${published.length} static data files to public/data`);
