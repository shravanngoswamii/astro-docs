---
title: Themes
description: The built-in theme presets and how to use them.
sidebar:
  order: 3
---

Set a theme with the `theme` option:

```js title="astro.config.mjs"
astroDocs({ title: "My Docs", theme: "nord" });
```

## Built-in presets

| Theme | Description |
| --- | --- |
| `default` | Clean, modern look — Inter, warm paper-white, green accent. The default. |
| `paper` | Cream background, Georgia serif, generous measure. The whole site reads like print. |
| `nord` | Cool arctic palette (Snow Storm light, Polar Night dark). |
| `dracula` | Purple-forward (Alucard light, classic Dracula dark). |
| `rose-pine` | Muted, cozy (Dawn light, Main dark). |
| `slate` | Neutral grayscale, no color accent — calm and professional. |

Each preset defines **both** light and dark palettes; which are reachable depends
on [`colorScheme`](/docs/guides/theming#dark-mode).

## Special values

- `theme: "default"` — the built-in base look.
- `theme: "none"` — no opinionated skin; structure + neutral tokens only.
- `theme: "./path/to/theme.css"` — your own theme file.
- `theme: "some-package/theme.css"` — a theme published as an npm package.

## Books always read as paper

Regardless of the chosen `theme`, pages in a `kind: "book"` collection adopt the
paper reading aesthetic. This is deliberate — docs and books want different
typography. To change it, override the `[data-docs-kind="book"]` tokens in your
`customCss` (see [Theming](/docs/guides/theming#docs-vs-book-look)).

## Writing a theme

A theme is just CSS that sets `--docs-*` tokens inside `@layer docs.theme`:

```css title="my-theme.css"
@layer docs.theme {
  :root {
    --docs-color-bg: #fffdf9;
    --docs-color-accent: #c2410c;
    /* …the rest of the tokens you want to change */
  }
  [data-theme="dark"] {
    --docs-color-bg: #1a1410;
    --docs-color-accent: #fb923c;
  }
}
```

Publish it as a package that ships this file and users can opt in with
`theme: "your-theme/theme.css"`.
