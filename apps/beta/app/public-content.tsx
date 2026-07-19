import Link from "next/link";
import partners from "./data/partners.json";
import {
  canonicalPath,
  canonicalUrl,
  defaultLocale,
  getCatalog,
  localePrefix,
  normalizeLocale,
  siteOrigin,
  type Cycle,
  type Locale,
  type Resource,
  type RouteProfile,
  type Station,
} from "./public-method-data";

function JsonLd({ value }: { value: unknown }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(value).replace(/</g, "\\u003c") }}
    />
  );
}

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export function PublicHomeContent({ locale = defaultLocale }: { locale?: string }) {
  const normalized = normalizeLocale(locale);
  const data = getCatalog(normalized);
  const path = canonicalPath(normalized, "/");

  return (
    <main className="public-content">
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${siteOrigin}${path}#website`,
          name: "APIOps Cycles",
          url: `${siteOrigin}${path}`,
          inLanguage: normalized,
          hasPart: data.cycles.map((cycle) => ({
            "@type": "LearningResource",
            name: cycle.title,
            url: canonicalUrl(normalized, `/cycles/${cycle.slug}`),
          })),
        }}
      />
      <section className="public-hero">
        <p className="public-kicker">APIOps Cycles public beta</p>
        <h1>Stakeholder-Guided APIOps Cycles Method</h1>
        <p>
          Explore the APIOps Cycles method as cycle journeys, stations, stakeholder guides, and reusable resources.
        </p>
      </section>
      <section className="public-section" aria-labelledby="cycles">
        <h2 id="cycles">Cycles</h2>
        <div className="public-card-grid">
          {data.cycles.map((cycle) => (
            <article className="public-card" key={cycle.id}>
              <h3>
                <Link href={`${localePrefix(normalized)}/cycles/${cycle.slug}`}>{cycle.title}</Link>
              </h3>
              <p>{cycle.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="public-section" aria-labelledby="roles">
        <h2 id="roles">Stakeholder guides</h2>
        <ul className="public-link-list">
          {data.routeProfiles.map((role) => (
            <li key={role.id}>
              <Link href={`${localePrefix(normalized)}/roles/${role.id}`}>{role.title}</Link>
              <span>{role.summary}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export function PublicCycleContent({ cycle, locale = defaultLocale }: { cycle: Cycle; locale?: string }) {
  const normalized = normalizeLocale(locale);
  const prefix = localePrefix(normalized);
  const resources = uniqueById(cycle.stations.flatMap((station) => station.resources).filter((resource) => !resource.draft));
  const stakeholders = uniqueById(cycle.audienceStakeholders.length ? cycle.audienceStakeholders : cycle.stations.flatMap((station) => station.stakeholders));
  const url = canonicalUrl(normalized, `/cycles/${cycle.slug}`);

  return (
    <main className="public-content">
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          "@id": `${url}#cycle`,
          name: cycle.title,
          description: cycle.description,
          url,
          inLanguage: normalized,
          isPartOf: { "@type": "WebSite", name: "APIOps Cycles", url: siteOrigin },
          hasPart: cycle.stations.map((station) => ({
            "@type": "LearningResource",
            name: station.title,
            description: station.description,
            url: canonicalUrl(normalized, `/stations/${station.id}`),
          })),
          audience: stakeholders.slice(0, 12).map((role) => ({ "@type": "Audience", name: role.title })),
          license: "https://github.com/APIOpsCycles/apiops-cycles-method-data/blob/main/LICENSE",
        }}
      />
      <nav className="public-breadcrumbs" aria-label="Breadcrumb">
        <Link href={`${prefix}/`}>APIOps Cycles</Link>
        <span aria-hidden="true">/</span>
        <span>{cycle.title}</span>
      </nav>
      <section className="public-hero">
        <p className="public-kicker">Cycle</p>
        <h1>{cycle.title}</h1>
        <p>{cycle.description}</p>
        {cycle.purpose ? <p>{cycle.purpose}</p> : null}
      </section>
      <section className="public-section" aria-labelledby="stations">
        <h2 id="stations">Stations</h2>
        <ol className="public-step-list">
          {cycle.stations.map((station) => (
            <li key={station.id}>
              <h3>
                <Link href={`${prefix}/stations/${station.id}`}>{station.title}</Link>
              </h3>
              <p>{station.description}</p>
              {station.whyItMatters ? <p>{station.whyItMatters}</p> : null}
            </li>
          ))}
        </ol>
      </section>
      <section className="public-section" aria-labelledby="stakeholders">
        <h2 id="stakeholders">Stakeholders and roles</h2>
        <ul className="public-link-list">
          {stakeholders.map((stakeholder) => (
            <li key={stakeholder.id}>
              <Link href={`${prefix}/roles/${stakeholder.id}`}>{stakeholder.title}</Link>
              <span>{stakeholder.description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="public-section" aria-labelledby="resources">
        <h2 id="resources">Resources and canvases</h2>
        <ul className="public-link-list">
          {resources.map((resource) => (
            <li key={resource.id}>
              <Link href={`${prefix}/${resource.slug}`}>{resource.title}</Link>
              <span>{resource.description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="public-section" aria-labelledby="license">
        <h2 id="license">Attribution and licensing</h2>
        <p>
          APIOps Cycles method data is maintained by the APIOps Cycles community. See the{" "}
          <Link href={`${prefix}/licensing`}>licensing page</Link> for reuse context.
        </p>
      </section>
    </main>
  );
}

export function PublicStationContent({ station, locale = defaultLocale }: { station: Station; locale?: string }) {
  const normalized = normalizeLocale(locale);
  const prefix = localePrefix(normalized);
  const url = canonicalUrl(normalized, `/stations/${station.id}`);
  const cycles = getCatalog(normalized).cycles.filter((cycle) =>
    cycle.stations.some((item) => item.id === station.id),
  );

  return (
    <main className="public-content">
      <JsonLd
        value={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          "@id": `${url}#station`,
          name: station.title,
          description: station.description,
          url,
          inLanguage: normalized,
          isPartOf: cycles.map((cycle) => ({
            "@type": "LearningResource",
            name: cycle.title,
            url: canonicalUrl(normalized, `/cycles/${cycle.slug}`),
          })),
        }}
      />
      <nav className="public-breadcrumbs" aria-label="Breadcrumb">
        <Link href={`${prefix}/`}>APIOps Cycles</Link>
        <span aria-hidden="true">/</span>
        <span>{station.title}</span>
      </nav>
      <section className="public-hero">
        <p className="public-kicker">Station</p>
        <h1>{station.title}</h1>
        <p>{station.description}</p>
        {station.whyItMatters ? <p>{station.whyItMatters}</p> : null}
      </section>
      <PublicDetailSections station={station} prefix={prefix} />
    </main>
  );
}

function PublicDetailSections({ station, prefix }: { station: Station; prefix: string }) {
  return (
    <>
      <section className="public-section" aria-labelledby="outcomes">
        <h2 id="outcomes">Expected outcomes</h2>
        <ul>{station.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      </section>
      <section className="public-section" aria-labelledby="work">
        <h2 id="work">How to apply it in work</h2>
        <p>{station.applyInWork}</p>
        <ol>
          {station.steps.map((step) => (
            <li key={step.text}>
              {step.text}
              {step.resourceId && step.resourceTitle ? (
                <> <Link href={`${prefix}/resources/${step.resourceId}`}>{step.resourceTitle}</Link></>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      <section className="public-section" aria-labelledby="station-resources">
        <h2 id="station-resources">Related resources</h2>
        <ul className="public-link-list">
          {station.resources.filter((resource) => !resource.draft).map((resource) => (
            <li key={resource.id}>
              <Link href={`${prefix}/${resource.slug}`}>{resource.title}</Link>
              <span>{resource.description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="public-section" aria-labelledby="station-roles">
        <h2 id="station-roles">People to involve</h2>
        <ul className="public-link-list">
          {station.stakeholders.map((stakeholder) => (
            <li key={stakeholder.id}>
              <Link href={`${prefix}/roles/${stakeholder.id}`}>{stakeholder.title}</Link>
              <span>{stakeholder.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function PublicResourceContent({ resource, locale = defaultLocale }: { resource: Resource; locale?: string }) {
  const normalized = normalizeLocale(locale);
  const prefix = localePrefix(normalized);
  const url = canonicalUrl(normalized, `/${resource.slug}`);

  return (
    <main className="public-content">
      <JsonLd value={{ "@context": "https://schema.org", "@type": "LearningResource", "@id": `${url}#resource`, name: resource.title, description: resource.description, url, inLanguage: normalized }} />
      <nav className="public-breadcrumbs" aria-label="Breadcrumb">
        <Link href={`${prefix}/`}>APIOps Cycles</Link>
        <span aria-hidden="true">/</span>
        <span>{resource.title}</span>
      </nav>
      <section className="public-hero">
        <p className="public-kicker">{resource.category}</p>
        <h1>{resource.title}</h1>
        <p>{resource.description}</p>
      </section>
      <section className="public-section" aria-labelledby="resource-outcomes">
        <h2 id="resource-outcomes">Expected outcomes</h2>
        <ul>{resource.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
      </section>
      <section className="public-section" aria-labelledby="resource-steps">
        <h2 id="resource-steps">How to use it</h2>
        <ol>{resource.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </section>
    </main>
  );
}

export function PublicRoleContent({ role, locale = defaultLocale }: { role: RouteProfile; locale?: string }) {
  const normalized = normalizeLocale(locale);
  const prefix = localePrefix(normalized);
  const url = canonicalUrl(normalized, `/roles/${role.id}`);

  return (
    <main className="public-content">
      <JsonLd value={{ "@context": "https://schema.org", "@type": "DefinedTerm", "@id": `${url}#role`, name: role.title, description: role.summary, url, inLanguage: normalized }} />
      <nav className="public-breadcrumbs" aria-label="Breadcrumb">
        <Link href={`${prefix}/`}>APIOps Cycles</Link>
        <span aria-hidden="true">/</span>
        <span>{role.title}</span>
      </nav>
      <section className="public-hero">
        <p className="public-kicker">Stakeholder guide</p>
        <h1>{role.title}</h1>
        <p>{role.summary}</p>
      </section>
      <section className="public-section" aria-labelledby="role-cycles">
        <h2 id="role-cycles">Relevant cycles</h2>
        <ul className="public-link-list">
          {role.cycles.map((cycle) => (
            <li key={cycle.id}>
              <Link href={`${prefix}/cycles/${cycle.id}`}>{cycle.title}</Link>
              <span>{cycle.description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="public-section" aria-labelledby="role-stations">
        <h2 id="role-stations">Relevant stations</h2>
        <ul className="public-link-list">
          {role.stations.map((station) => (
            <li key={station.id}>
              <Link href={`${prefix}/stations/${station.id}`}>{station.title}</Link>
              <span>{station.description}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="public-section" aria-labelledby="role-decisions">
        <h2 id="role-decisions">Decisions and outputs</h2>
        <ul>{role.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
      </section>
      <section className="public-section" aria-labelledby="role-resources">
        <h2 id="role-resources">Recommended resources</h2>
        <ul className="public-link-list">
          {role.recommendedResources.filter((resource) => !resource.draft).map((resource) => (
            <li key={resource.id}>
              <Link href={`${prefix}/${resource.slug}`}>{resource.title}</Link>
              <span>{resource.description}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export function PublicPartnersContent() {
  return (
    <main className="public-content">
      <section className="public-hero">
        <p className="public-kicker">Community</p>
        <h1>APIOps Cycles Partners</h1>
        <p>Organizations supporting APIOps Cycles community adoption, training, method development, and implementation.</p>
      </section>
      <section className="public-section" aria-labelledby="partners">
        <h2 id="partners">Partners</h2>
        <div className="public-card-grid">
          {partners.items.map((partner) => (
            <article className="public-card" key={partner.href}>
              <h3><a href={partner.href}>{partner.title}</a></h3>
              <p>{partner.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export function PublicLicensingContent() {
  return (
    <main className="public-content">
      <section className="public-hero">
        <p className="public-kicker">Reuse</p>
        <h1>APIOps Cycles Licensing</h1>
        <p>
          APIOps Cycles public method content is attributed to the APIOps Cycles community and Osaango. Use the source repository license as the authoritative reuse reference.
        </p>
      </section>
      <section className="public-section" aria-labelledby="license-source">
        <h2 id="license-source">License source</h2>
        <p>
          Review the current license in the{" "}
          <a href="https://github.com/APIOpsCycles/apiops-cycles-method-data/blob/main/LICENSE">
            APIOps Cycles method data repository
          </a>.
        </p>
      </section>
    </main>
  );
}
