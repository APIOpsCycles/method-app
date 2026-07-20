"use client";

import { usePathname, useRouter } from "next/navigation";
import partners from "generated-data/partners.json";
import routeIndex from "generated-data/route-index.json";

const localeNames: Record<string, string> = { en: "English", fi: "Suomi", fr: "Français", de: "Deutsch", pt: "Português" };
const repository = "https://github.com/APIOpsCycles/apiops-cycles-method-data";

function routeLocale(pathname: string) {
  const first = pathname.split("/")[1];
  return routeIndex.locales.includes(first) ? first : routeIndex.defaultLocale;
}

function localizedPath(locale: string, path: string) {
  return locale === routeIndex.defaultLocale ? path : `/${locale}${path}`;
}

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const locale = routeLocale(pathname);

  function changeLocale(next: string) {
    const segments = pathname.split("/").filter(Boolean);
    if (routeIndex.locales.includes(segments[0])) segments.shift();
    const path = `/${segments.join("/")}`;
    // The design system is intentionally English-only.
    router.push(path === "/design-system" ? path : localizedPath(next, path === "/" ? "" : path));
  }

  return (
    <div className="global-shell">
      <header className="global-header">
        <nav className="global-nav" aria-label="Main navigation">
          <a className="brand" href={localizedPath(locale, "/")}><img src="/assets/apiops-cycles-logo-dark.svg" alt="" /><span>APIOps Cycles</span></a>
          <div className="global-nav__links">
            <a href={localizedPath(locale, "/partners")}>Partners</a>
            <a href={repository} target="_blank" rel="noreferrer">GitHub</a>
            <a href="/design-system">Design system</a>
            <a href={localizedPath(locale, "/data")}>Data</a>
            <label><span className="sr-only">Language</span><select aria-label="Language" value={locale} onChange={(event) => changeLocale(event.target.value)}>{routeIndex.locales.map((item) => <option key={item} value={item}>{localeNames[item] ?? item}</option>)}</select></label>
          </div>
        </nav>
      </header>
      {children}
      <footer className="global-footer">
        <section aria-labelledby="footer-partners"><h2 id="footer-partners">Our partners</h2><div className="global-footer__partners">{partners.items.map((partner) => <a className="ds-partner-card" key={partner.href} href={partner.href} target="_blank" rel="noreferrer"><img src={partner.logo} alt={`${partner.title} logo`} /><strong>{partner.title}</strong></a>)}</div></section>
        <div className="global-footer__legal"><span>APIOps Cycles method content is community-maintained.</span><a href={localizedPath(locale, "/licensing")}>Licensing</a><a href={repository} target="_blank" rel="noreferrer">GitHub repository</a></div>
      </footer>
    </div>
  );
}
