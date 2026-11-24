# Practical tools directory

`/resources` and its `/fi`, `/fr`, `/de`, `/pt` variants give new visitors a
tool-first entry into the existing method. This is an index, not a second
resource database. `resourceDirectory()` reads the same generated localized
catalog as station pages and individual resource pages. Draft resources remain
excluded. Tool purposes, type labels and station/cycle relationships come from
those method records. References in cycle-specific station resources, steps and
role responsibilities determine the related cycles.

The index provides text search, type and cycle filters, related stations/cycles,
purpose/instructions links and direct CanvasCreator workspace links where a
canvas ID exists. No download is advertised unless supplied by the existing
tool/workspace. Search includes descriptions and usage guidance, so a query can
also reveal supporting tools rather than only exact title matches.

Filtering is progressive enhancement over server-rendered HTML. All 30 current
public tools and their links remain usable without JavaScript. Filter state uses
`q`, `type` and `cycle` URL parameters. Search is accent-insensitive and matches
all entered words. Empty results are announced and reset clears the filters.

The index appears in primary navigation, individual resource pages, the localized
route inventory/sitemap, Markdown discovery and full method text. No content is
published by editing or building these files; deploy through the normal site
process before distributing a booklet that links to `/resources`.

Validation: production site build passed; focused ESLint passed; three browser
tests cover search, type/cycle combinations, empty/reset, URL restoration, mobile,
no-JavaScript browsing, locales, sitemap and Markdown. Existing method Markdown
and presentation-image regressions passed. The live `/partners/` page was also
reviewed: it already describes the four actual partners and links to each
partner's own contact destination.

Run:

```powershell
npm run build --workspace @apiops/site
npx playwright test apps/site/e2e/resources.spec.ts
node --test apps/site/test/method-markdown.integration.test.mjs
```
