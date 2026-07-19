# APIOps Cycles site

The production site is being migrated to a statically generated Astro application.

## Applications

- `apps/site/` contains the Astro source. The root `astro.config.mjs` sets `output: "static"`; React is reserved for explicitly hydrated interactive islands.
- `apps/beta/` retains the vinext application while route and feature parity are verified. Its Cloudflare worker and Sites Vite plugin are beta-only and are not part of the Astro build.

## Configuration

Set `PUBLIC_SITE_ORIGIN` to the public origin used for Astro canonical URLs and the static host's `site` setting. During migration, `NEXT_PUBLIC_SITE_ORIGIN` and `SITE_ORIGIN` remain supported as fallbacks. The default is `https://beta.apiopscycles.com`.

## Commands

```bash
npm install
npm run dev          # Astro development server
npm run build        # static Astro production artifact in dist/
npm run dev:beta     # temporary vinext application
npm run build:beta   # verify the temporary vinext application
```
