# astro-docs

A customizable documentation **and book** framework for Astro — Starlight-class
features, but the docs look like *your* site, not the framework.

[![CI](https://github.com/shravanngoswamii/astro-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/shravanngoswamii/astro-docs/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/astro-docs.svg)](https://www.npmjs.com/package/astro-docs)
[![license](https://img.shields.io/npm/l/astro-docs.svg)](./packages/astro-docs/LICENSE)

**Docs:** https://shravanngoswamii.github.io/astro-docs/ · **Package:** [`packages/astro-docs`](./packages/astro-docs)

## Why

Framework styles live entirely in CSS cascade layers, so your own stylesheet
always wins — no `!important`, no fighting specificity. Zero client JS by default.

- Config-driven sidebar with autogenerate, Pagefind search, scrollspy TOC
- Callouts, breadcrumbs, prev/next, component overrides
- A full design-token system (color, type scale, spacing, shape, motion) + built-in themes
- **Book mode**: numbered chapters, `@fig`/`@sec` cross-references, KaTeX math
- Base-path aware (deploys cleanly under a subpath)

## Quick start

```sh
npm install astro-docs
```

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import astroDocs from "astro-docs";

export default defineConfig({
  integrations: [astroDocs({ title: "My Docs" })],
});
```

Then define a content collection and drop Markdown into `src/content/docs/`. See
the [package README](./packages/astro-docs) and the [docs site](https://shravanngoswamii.github.io/astro-docs/) for the full guide.

## Repository layout

```
packages/astro-docs   the framework (published to npm)
examples/playground   the demo + documentation site
```

## Development

```sh
pnpm install
pnpm dev        # run the playground/docs site
pnpm verify     # biome + typecheck + tests + build
pnpm changeset  # record a change for the next release
```

Releases are automated with [Changesets](https://github.com/changesets/changesets):
merging the generated "Release" PR publishes to npm.

## License

MIT © [Shravan Goswami](https://shravangoswami.com)
