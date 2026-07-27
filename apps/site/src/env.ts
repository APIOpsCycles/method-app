const configuredOrigin =
  import.meta.env.PUBLIC_SITE_ORIGIN ??
  import.meta.env.NEXT_PUBLIC_SITE_ORIGIN ??
  import.meta.env.SITE_ORIGIN ??
  "https://apiopscycles.com";

export const siteOrigin = configuredOrigin.replace(/\/$/, "");

export function canonicalUrl(pathname: string) {
  return new URL(pathname, `${siteOrigin}/`).toString();
}
