# APIOps Cycles site

The production site is a statically generated Astro application.

## Applications

- `apps/site/` contains the Astro source. `apps/site/astro.config.mjs` sets `output: "static"`; React is reserved for explicitly hydrated interactive islands.

## Configuration

Set `PUBLIC_SITE_ORIGIN` to the public origin used for Astro canonical URLs and the static host's `site` setting. During migration, `NEXT_PUBLIC_SITE_ORIGIN` and `SITE_ORIGIN` remain supported as fallbacks. The default is `https://beta.apiopscycles.com`.

## Generated method data

`npm run prepare:local-data` writes internal build artifacts to `generated/method/` and publishes only the JSON integration surface under `public/data/`. The root build scripts run it automatically before building the Astro site.

## Commands

```bash
npm install
npm run dev          # Astro development server
npm run prepare:local-data # build and sync local package data
npm run build        # static Astro production artifact in dist/
npm start            # preview the built Astro site locally
```
