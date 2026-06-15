---
title: Design Tokens
description: Every --docs-* custom property — color, type, spacing, shape, motion.
sidebar:
  order: 4
---

The whole design is a system of `--docs-*` custom properties. Override any of them
in your [`customCss`](/docs/guides/theming#tier-1-override-design-tokens) (under
`:root`, and `[data-theme="dark"]` for dark mode). You're not limited to colors —
spacing, type scale, weights, radii, and motion are all tokenized, so you can
reshape the design, not just recolor it.

## Colors

| Token | Purpose |
| --- | --- |
| `--docs-color-bg` | Page background |
| `--docs-color-surface` | Raised surfaces (cards, search, pagination) |
| `--docs-color-surface-muted` | Subtle fills, hover backgrounds, inline code |
| `--docs-color-text` | Body text |
| `--docs-color-muted` | Secondary text |
| `--docs-color-faint` | Labels, captions, the faintest text |
| `--docs-color-border` | Borders and hairlines |
| `--docs-color-accent` | Links, active states, highlights |
| `--docs-color-accent-strong` | Stronger accent (hover, current link) |
| `--docs-color-accent-soft` | Translucent accent (badges, tints) |
| `--docs-color-code-bg` | Code background |
| `--docs-color-sidebar-active-bg` | Active sidebar link background |
| `--docs-color-warning` | Warning callouts |
| `--docs-color-ring` | Focus ring color |

## Typography

| Token | Default | Purpose |
| --- | --- | --- |
| `--docs-font-body` | system sans stack | Body text |
| `--docs-font-display` | (same as body) | Headings — set this for a display face |
| `--docs-font-mono` | system mono stack | Code |
| `--docs-font-ui` | (same as body) | Nav, labels, chrome |
| `--docs-line-height` | `1.7` | Body line height |
| `--docs-leading-tight` | `1.2` | Heading line height |
| `--docs-weight-normal / -medium / -semibold / -bold` | 400 / 500 / 600 / 700 | Font weights |
| `--docs-tracking-tight` | `-0.014em` | Heading letter-spacing |
| `--docs-tracking-label` | `0.07em` | Uppercase label tracking |

### Type scale

`--docs-text-xs` `-sm` `-base` `-lg` `-xl` `-2xl` `-3xl` `-title` — a modular
scale from `0.75rem` to a fluid `clamp()` page title. Override any step to retune
the hierarchy.

## Spacing

A 4px-based scale used for all rhythm and gaps:

`--docs-space-1` (`0.25rem`) · `-2` · `-3` · `-4` (`1rem`) · `-5` · `-6` · `-8` ·
`-10` · `-12` · `-16` (`4rem`).

## Layout

| Token | Default | Purpose |
| --- | --- | --- |
| `--docs-sidebar-width` | `16rem` | Left sidebar width |
| `--docs-toc-width` | `14rem` | Right TOC rail width |
| `--docs-content-max-width` | `46rem` | Prose measure |
| `--docs-max-width` | `1320px` | Overall layout max width |
| `--docs-content-gap` | `3rem` | Gap between columns |
| `--docs-header-height` | `4rem` | Sticky header height |

## Shape & motion

| Token | Default | Purpose |
| --- | --- | --- |
| `--docs-radius-sm` | `0.375rem` | Small radius (chips, links) |
| `--docs-border-radius` | `0.5rem` | Base radius |
| `--docs-radius-lg` | `0.875rem` | Large radius (dialogs) |
| `--docs-shadow-sm` / `--docs-shadow` | — | Elevation |
| `--docs-transition` | `150ms cubic-bezier(.4,0,.2,1)` | Standard transition |

## Example

```css title="src/styles/brand.css"
:root {
  /* color */
  --docs-color-accent: #2563eb;
  /* type — swap in a display font and a tighter body measure */
  --docs-font-display: "Fraunces", Georgia, serif;
  --docs-content-max-width: 52rem;
  /* shape */
  --docs-border-radius: 4px;
}

[data-theme="dark"] {
  --docs-color-accent: #60a5fa;
}
```

:::tip
Override `--docs-font-display` alone to give your headings a distinctive
typeface while keeping body text fast and legible.
:::
