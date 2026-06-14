---
title: Design Tokens
description: Every --docs-* custom property you can override.
sidebar:
  order: 4
---

Every visual aspect is driven by these CSS custom properties. Override any of them
in your [`customCss`](/docs/guides/theming#tier-1-override-design-tokens) (under
`:root`, and `[data-theme="dark"]` for dark mode).

## Colors

| Token | Purpose |
| --- | --- |
| `--docs-color-bg` | Page background |
| `--docs-color-surface` | Raised surfaces (cards, search, pagination) |
| `--docs-color-surface-muted` | Subtle fills, hover backgrounds |
| `--docs-color-text` | Body text |
| `--docs-color-muted` | Secondary text, labels |
| `--docs-color-border` | Borders and rules |
| `--docs-color-accent` | Links, active states, highlights |
| `--docs-color-accent-strong` | Stronger accent (hover, current link) |
| `--docs-color-code-bg` | Inline code and code-block background |
| `--docs-color-sidebar-bg` | Sidebar background |
| `--docs-color-sidebar-active-bg` | Active sidebar link background |
| `--docs-color-warning` | Warning/caution callouts |

## Typography

| Token | Default | Purpose |
| --- | --- | --- |
| `--docs-font-body` | Inter, system-ui | Body and prose |
| `--docs-font-mono` | SFMono, ui-monospace | Code |
| `--docs-font-ui` | (same as body) | Nav, labels, chrome |
| `--docs-font-size-base` | `1rem` | Base font size |
| `--docs-line-height` | `1.75` | Body line height |

## Layout

| Token | Default | Purpose |
| --- | --- | --- |
| `--docs-sidebar-width` | `15rem` | Left sidebar width |
| `--docs-toc-width` | `13rem` | Right TOC rail width |
| `--docs-content-max-width` | `48rem` | Prose measure |
| `--docs-max-width` | `1280px` | Overall layout max width |
| `--docs-header-height` | `4rem` | Sticky header height |
| `--docs-gutter` | `2rem` | Outer/inner spacing |
| `--docs-border-radius` | `8px` | Corner radius across the UI |

## Example

```css title="src/styles/brand.css"
:root {
  --docs-color-accent: #2563eb;
  --docs-font-body: "Geist", system-ui, sans-serif;
  --docs-content-max-width: 52rem;
  --docs-border-radius: 4px;
}

[data-theme="dark"] {
  --docs-color-accent: #60a5fa;
}
```

:::tip
Changing only `--docs-color-accent` + `--docs-font-body` is usually enough to make
the docs feel like an extension of your brand.
:::
