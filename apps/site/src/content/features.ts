import type { Locale } from "../lib/method-data";

export const featureSlugs = ["contextual-navigation", "semantic-knowledge-graph", "multi-cycle-method", "ai-ready-method", "open-json-data", "canvas-workspace"] as const;
export type FeatureSlug = (typeof featureSlugs)[number];
type Feature = { slug: FeatureSlug; title: string; summary: string; marker: string };

const en: Feature[] = [
  { slug: "contextual-navigation", title: "Contextual Navigation", summary: "Choose a role and goal to reveal a relevant route through the method.", marker: "01" },
  { slug: "semantic-knowledge-graph", title: "Semantic Knowledge Graph", summary: "Query explicit relationships between cycles, stations, lines, roles, goals, and resources.", marker: "02" },
  { slug: "multi-cycle-method", title: "Multi-cycle Method", summary: "Move from discovery to operation without forcing every initiative into one linear process.", marker: "03" },
  { slug: "ai-ready-method", title: "AI-ready Method", summary: "Give assistants structured, bounded method context instead of an undifferentiated document set.", marker: "04" },
  { slug: "open-json-data", title: "Open JSON Data", summary: "Build integrations from versionable, downloadable method data with stable identifiers.", marker: "05" },
  { slug: "canvas-workspace", title: "Canvas Workspace", summary: "Turn guidance into workshop output in a private, portable browser workspace.", marker: "06" },
];
const translated: Partial<Record<Locale, Array<Pick<Feature, "title" | "summary">>>> = {
  fi: [
    { title: "Kontekstuaalinen navigointi", summary: "Valitse rooli ja tavoite nähdäksesi työhösi sopivan reitin menetelmän läpi." }, { title: "Semanttinen tietämysgraafi", summary: "Tutki syklien, asemien, linjojen, roolien, tavoitteiden ja resurssien välisiä suhteita." }, { title: "Monisyklinen menetelmä", summary: "Etene löytämisestä operointiin pakottamatta jokaista hanketta yhteen lineaariseen prosessiin." }, { title: "Tekoälyvalmis menetelmä", summary: "Anna avustajille jäsennelty ja rajattu menetelmäkonteksti eriytymättömän dokumenttijoukon sijaan." }, { title: "Avoin JSON-data", summary: "Rakenna integraatioita versioitavasta ja ladattavasta menetelmädatasta vakailla tunnisteilla." }, { title: "Canvas-työtila", summary: "Muuta ohjeistus työpajatuotoksiksi yksityisessä ja siirrettävässä selainympäristössä." },
  ],
  fr: [
    { title: "Navigation contextuelle", summary: "Choisissez un rôle et un objectif pour révéler un parcours pertinent dans la méthode." }, { title: "Graphe de connaissances sémantique", summary: "Explorez les relations explicites entre cycles, stations, lignes, rôles, objectifs et ressources." }, { title: "Méthode multi-cycle", summary: "Passez de la découverte à l'exploitation sans imposer un processus linéaire unique." }, { title: "Méthode prête pour l’IA", summary: "Fournissez aux assistants un contexte méthodologique structuré et délimité." }, { title: "Données JSON ouvertes", summary: "Créez des intégrations à partir de données téléchargeables, versionnables et aux identifiants stables." }, { title: "Espace de travail Canvas", summary: "Transformez les conseils en résultats d’atelier dans un espace navigateur privé et portable." },
  ],
  de: [
    { title: "Kontextbezogene Navigation", summary: "Wählen Sie Rolle und Ziel, um einen passenden Weg durch die Methode zu sehen." }, { title: "Semantischer Wissensgraph", summary: "Erkunden Sie explizite Beziehungen zwischen Zyklen, Stationen, Linien, Rollen, Zielen und Ressourcen." }, { title: "Multi-Cycle-Methode", summary: "Gelangen Sie von der Entdeckung zum Betrieb, ohne jedes Vorhaben in einen linearen Prozess zu zwingen." }, { title: "KI-fähige Methode", summary: "Geben Sie Assistenten strukturierten, begrenzten Methodenkontext statt einer ungeordneten Dokumentsammlung." }, { title: "Offene JSON-Daten", summary: "Erstellen Sie Integrationen mit versionierbaren, herunterladbaren Methodendaten und stabilen IDs." }, { title: "Canvas-Arbeitsbereich", summary: "Verwandeln Sie Anleitungen in Workshop-Ergebnisse in einem privaten, portablen Browser-Arbeitsbereich." },
  ],
  pt: [
    { title: "Navegação contextual", summary: "Escolha um papel e um objetivo para revelar um percurso relevante pelo método." }, { title: "Grafo de conhecimento semântico", summary: "Explore relações explícitas entre ciclos, estações, linhas, papéis, objetivos e recursos." }, { title: "Método multiciclo", summary: "Passe da descoberta à operação sem forçar cada iniciativa num único processo linear." }, { title: "Método preparado para IA", summary: "Forneça aos assistentes um contexto do método estruturado e delimitado." }, { title: "Dados JSON abertos", summary: "Crie integrações com dados do método versionáveis, transferíveis e com identificadores estáveis." }, { title: "Espaço de trabalho Canvas", summary: "Transforme orientações em resultados de workshop num espaço privado e portátil no navegador." },
  ],
};

export const featureUi = {
  en: { kicker: "Method features", heading: "A method built to be used", intro: "Explore the capabilities that make APIOps Cycles navigable, interoperable, and practical for people and machines.", explore: "Explore feature", all: "All features", work: "Put it to work", overview: "How it helps", source: "Explore this capability and its connected method content.", open: "Explore the method" },
  fi: { kicker: "Menetelmän ominaisuudet", heading: "Käyttöön rakennettu menetelmä", intro: "Tutustu ominaisuuksiin, jotka tekevät APIOps Cycles -menetelmästä navigoitavan, yhteentoimivan ja käytännöllisen.", explore: "Tutustu ominaisuuteen", all: "Kaikki ominaisuudet", work: "Ota käyttöön", overview: "Miten se auttaa", source: "Tutustu tähän ominaisuuteen ja siihen liittyvään menetelmäsisältöön.", open: "Tutustu menetelmään" },
  fr: { kicker: "Fonctionnalités de la méthode", heading: "Une méthode conçue pour être utilisée", intro: "Découvrez les capacités qui rendent APIOps Cycles navigable, interopérable et pratique.", explore: "Découvrir", all: "Toutes les fonctionnalités", work: "Mettre en pratique", overview: "Comment cela aide", source: "Découvrez cette fonctionnalité et le contenu méthodologique associé.", open: "Explorer la méthode" },
  de: { kicker: "Methodenfunktionen", heading: "Eine Methode für die Praxis", intro: "Entdecken Sie die Funktionen, die APIOps Cycles navigierbar, interoperabel und praktisch machen.", explore: "Funktion erkunden", all: "Alle Funktionen", work: "In die Praxis umsetzen", overview: "Wie es hilft", source: "Entdecken Sie diese Funktion und die zugehörigen Methodeninhalte.", open: "Methode erkunden" },
  pt: { kicker: "Funcionalidades do método", heading: "Um método feito para ser utilizado", intro: "Explore as capacidades que tornam o APIOps Cycles navegável, interoperável e prático.", explore: "Explorar funcionalidade", all: "Todas as funcionalidades", work: "Colocar em prática", overview: "Como ajuda", source: "Explore esta funcionalidade e o conteúdo relacionado do método.", open: "Explorar o método" },
} satisfies Record<Locale, Record<string, string>>;

export function getFeatures(locale: Locale = "en"): Feature[] { return en.map((feature, index) => ({ ...feature, ...(translated[locale]?.[index] ?? {}) })); }
export const features = getFeatures("en");
export const featurePath = (locale: Locale, slug: FeatureSlug) => `${locale === "en" ? "" : `/${locale}`}/features/${slug}`;
