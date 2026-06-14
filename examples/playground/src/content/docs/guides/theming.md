---
title: Theming & Customization
description: Make astro-docs look exactly like your site — three tiers, from one line to total control.
sidebar:
  order: 3
---

astro-docs is built so the docs look like **your** site, not like the framework.
Every framework style lives inside a CSS [cascade layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer); your own CSS is unlayered, so it always wins — no `!important`, no specificity battles.

There are three tiers of customization. Most sites only need the first.

## Tier 1 — Override design tokens

The entire look is driven by `--docs-*` CSS custom properties. Override them in a
stylesheet and point `customCss` at it:

```js title="astro.config.mjs"
astroDocs({
  title: "My Docs",
  customCss: ["./src/styles/brand.css"],
});
```

```css title="src/styles/brand.css"
:root {
  --docs-color-accent: #e0245e;
  --docs-color-accent-strong: #b81d4b;
  --docs-font-body: "Inter", system-ui, sans-serif;
  --docs-sidebar-width: 18rem;
  --docs-content-max-width: 50rem;
}
```

This covers roughly 90% of brand matching. See the [token reference](/docs/reference/tokens) for the full list.

:::tip
`customCss` files are imported **unlayered**, so they beat every framework default automatically. You never need `!important`.
:::

## Tier 2 — Restyle components

Need to change more than tokens? Target the stable `.docs-*` class names directly
in your `customCss`. Because your CSS is unlayered, it wins over the framework's
layered rules:

```css title="src/styles/brand.css"
.docs-sidebar-link--current {
  border-inline-start: 2px solid var(--docs-color-accent);
}

.docs-callout {
  border-radius: 12px;
}

.docs-header {
  backdrop-filter: none;
}
```

The class names (`.docs-sidebar`, `.docs-content`, `.docs-toc`, `.docs-callout`,
`.docs-pagination`, …) are a stable, documented API — they won't change between
minor versions.

## Tier 3 — Replace the preset or a component

For a ground-up look, choose a different starting point or swap components.

### Pick a built-in theme

```js
astroDocs({ title: "My Docs", theme: "nord" });
```

Built-in: `default` · `paper` · `nord` · `dracula` · `rose-pine` · `slate`.
See [Themes](/docs/reference/themes) for previews and details.

### Ship no skin at all

```js
astroDocs({ title: "My Docs", theme: "none" });
```

`theme: "none"` emits only structure and tokens with neutral defaults — you bring
100% of the visual design.

### Use your own theme file or a published theme

```js
// a local CSS file…
astroDocs({ theme: "./src/styles/my-theme.css" });

// …or an npm package that exports a theme stylesheet
astroDocs({ theme: "some-astro-docs-theme/theme.css" });
```

A theme file is just CSS that sets `--docs-*` tokens (and optionally component
rules) inside `@layer docs.theme`. That makes themes publishable as packages.

### Override a component

Replace any UI component with your own `.astro` file:

```js
astroDocs({
  title: "My Docs",
  components: {
    Header: "./src/overrides/Header.astro",
    Footer: "./src/overrides/Footer.astro",
  },
});
```

See the [Component Overrides](/docs/guides/component-overrides) guide for the full
list and how your component reads the current page.

## How the cascade is layered

The framework declares this layer order once, before any of its styles:

```css
@layer docs.tokens, docs.reset, docs.theme, docs.components, docs.content, docs.utils;
```

- `docs.tokens` — base `--docs-*` values (+ the dark block)
- `docs.theme` — the selected preset, mapping tokens to a look
- `docs.components` / `docs.content` — the `.docs-*` component and prose rules
- **your `customCss`** — unlayered, so it always wins

## Dark mode

```js
astroDocs({ title: "My Docs", colorScheme: "both" });
```

- `"light"` (default) — light only, **zero JavaScript**
- `"dark"` — dark only
- `"both"` — light + dark with a toggle and a tiny no-flash inline script

Dark values live under `[data-theme="dark"]`. Every built-in theme defines both
palettes; if you author tokens, set both:

```css
:root { --docs-color-bg: #fff; }
[data-theme="dark"] { --docs-color-bg: #111; }
```

## Docs vs. book look

Pages in a `kind: "book"` collection automatically adopt a cream, serif **paper**
reading aesthetic — independent of your `theme`. This is applied via a
`data-docs-kind="book"` attribute on `<html>`.

To change or disable the book styling, target that attribute in your `customCss`:

```css
/* make books match the docs theme instead of paper */
[data-docs-kind="book"] {
  --docs-color-bg: var(--docs-color-surface);
  --docs-font-body: var(--docs-font-ui);
}
```
