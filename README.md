# APIOps Cycles site

The production site is being migrated to a statically generated Astro application.

## Applications

- `apps/site/` contains the Astro source. `apps/site/astro.config.mjs` sets `output: "static"`; React is reserved for explicitly hydrated interactive islands.
- `apps/beta/` retains the vinext application while route and feature parity are verified. Its Cloudflare worker and Sites Vite plugin are beta-only and are not part of the Astro build.

## Configuration

Set `PUBLIC_SITE_ORIGIN` to the public origin used for Astro canonical URLs and the static host's `site` setting. During migration, `NEXT_PUBLIC_SITE_ORIGIN` and `SITE_ORIGIN` remain supported as fallbacks. The default is `https://beta.apiopscycles.com`.

## Generated method data

`npm run prepare:local-data` writes internal build artifacts to `generated/method/` and publishes only the JSON integration surface under `public/data/`. Run it before building either the Astro site or the beta application; the root build scripts do this automatically.

## Commands

```bash
npm install
npm run dev          # Astro development server
npm run prepare:local-data # required before either application build
npm run build        # static Astro production artifact in dist/
npm start            # preview the built Astro site locally
npm run dev:beta     # temporary vinext application
npm run build:beta   # verify the temporary vinext application
npm run start:beta   # serve the built temporary vinext application
```
