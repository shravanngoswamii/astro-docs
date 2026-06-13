# astro-docs

A documentation **and book** framework for Astro — with Starlight-class features
and one defining difference: **the docs look like your site, not like the framework.**

Framework styles live entirely in CSS cascade layers, so your own stylesheet
always wins. Zero client JavaScript by default.

## Features

- **Config-driven sidebar** with autogenerate from your content directory
- **Search** via Pagefind (static index, lazy modal UI)
- **Table of contents**, breadcrumbs, prev/next pagination
- **Callouts** — `:::note` directives and GitHub-style `> [!NOTE]`
- **Expressive Code** code blocks (titles, line markers, copy button)
- **Book mode** — parts/chapters, numbered sections & figures, `@fig`/`@sec`
  cross-references, KaTeX math
- **Component overrides** — swap any UI component
- **Bring your own CSS** — layered defaults, unlayered overrides
- **Dark mode** — opt-in, with a no-flash inline script
- Sitemap, edit links, i18n-ready

## Install

```sh
npm install astro-docs
```

## Quick start

### 1. Add the integration

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import astroDocs from "astro-docs";

export default defineConfig({
  integrations: [
    astroDocs({
      title: "My Docs",
      collections: {
        docs: { kind: "docs", base: "/docs" },
      },
    }),
  ],
});
```

### 2. Define the content collection

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { docsLoader } from "astro-docs/loaders";
import { docsSchema } from "astro-docs/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema }),
};
```

### 3. Write Markdown

Drop files into `src/content/docs/`. They become pages automatically — no route
files to write.

```md
---
title: Getting Started
sidebar:
  order: 1
  badge: New
---

## Install
...
```

That's it. The integration injects the routes, builds the sidebar, and renders
each page.

## Configuration

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | required | Site title |
| `description` | `string` | — | Default meta description |
| `collections` | `Record<string, { kind, base, sidebar? }>` | `{ docs: { kind: "docs", base: "/" } }` | Mounted collections |
| `sidebar` | `SidebarItem[]` | autogenerate | Global sidebar (per-collection override available) |
| `theme` | `"paper" \| "none" \| string` | `"paper"` | Built-in preset, none, or a CSS path |
| `colorScheme` | `"light" \| "dark" \| "both"` | `"light"` | Dark mode (emits JS only when not `"light"`) |
| `customCss` | `string[]` | `[]` | Your stylesheets — imported unlayered, so they win |
| `tableOfContents` | `boolean \| { minHeadingLevel, maxHeadingLevel }` | `2–3` | Right-rail TOC |
| `pagination` | `boolean` | `true` | Prev/next links |
| `editLink` | `{ baseUrl }` | — | "Edit this page" links |
| `lastUpdated` | `boolean` | `false` | Show last-updated date (from frontmatter) |
| `social` | `Array<{ icon, label, href }>` | `[]` | Header social links |
| `components` | `Record<Name, path>` | `{}` | Override built-in components |
| `expressiveCode` | `boolean \| object` | `true` | Code block rendering |
| `pagefind` | `boolean \| object` | `true` | Search index |
| `math` | `boolean` | `false` | KaTeX math (`$…$`, `$$…$$`) |

## Sidebar

```js
sidebar: [
  { slug: "index", label: "Introduction" },
  { label: "Guides", autogenerate: { directory: "guides" } },
  {
    label: "Reference",
    items: [
      { slug: "reference/cli" },
      { label: "External", link: "https://example.com", badge: "↗" },
    ],
  },
]
```

- A bare string or `{ slug }` is an internal link (label falls back to the page title).
- `{ label, link }` is a manual/external link.
- `{ label, items }` is a group.
- `{ label?, autogenerate: { directory } }` builds items from a directory.

A directory's own `index` page becomes a leading link; subdirectories become
collapsible groups.

## Theming (bring your own look)

Three tiers, in increasing power:

1. **Override tokens** — set `--docs-*` variables in your `customCss`:
   ```css
   :root {
     --docs-color-accent: #b8460e;
     --docs-font-body: "Inter", sans-serif;
     --docs-sidebar-width: 18rem;
   }
   ```
2. **Restyle components** — target the stable `.docs-*` classes. Your unlayered
   CSS beats the framework's layered defaults automatically.
3. **Replace the preset** — `theme: "none"` ships zero skin, or point `theme` at
   your own CSS file.

## Component overrides

```js
astroDocs({
  title: "My Docs",
  components: {
    Header: "./src/overrides/Header.astro",
    Footer: "./src/overrides/Footer.astro",
  },
})
```

Overridable: `Head`, `ThemeProvider`, `SkipLink`, `PageFrame`, `Header`,
`SiteTitle`, `Logo`, `Search`, `SocialIcons`, `ThemeSelect`, `Sidebar`,
`TableOfContents`, `MobileTableOfContents`, `Banner`, `Breadcrumbs`, `PageTitle`,
`MarkdownContent`, `Footer`, `LastUpdated`, `Pagination`, `EditLink`, `Callout`.

Your component reads the current page via `Astro.locals.astroDocs` (see
`astro-docs/types` → `RouteData`).

## Book mode

Mount a collection with `kind: "book"` and use the `bookLoader` + `bookSchema`:

```ts
import { bookLoader } from "astro-docs/loaders";
import { bookSchema } from "astro-docs/schema";

export const collections = {
  book: defineCollection({ loader: bookLoader(), schema: bookSchema }),
};
```

Book frontmatter adds `chapter` and `numberSections`:

```md
---
title: Foundations
chapter: 1
numberSections: true
---

We refer back to @fig-overview and forward to @sec-scaling.

:::figure[The system overview.]{#overview}
![Overview](./overview.png)
:::

$$
T(n) = a \cdot n \log n + b
$$
```

- Headings are numbered (`1.1`, `1.2`, …) when `numberSections` is set.
- `:::figure{#id}` / `:::table{#id}` are numbered.
- `@fig-id`, `@sec-id`, `@tbl-id` resolve to numbered links at build time.

## Callouts

In Markdown:

```md
> [!WARNING]
> This is a warning.

:::tip
A tip with the default title.
:::

:::note[Custom title]
A note with a custom title.
:::
```

In MDX:

```mdx
import { Callout } from "astro-docs/components";

<Callout type="danger" title="Careful">Don't do this.</Callout>
```

## Exports

- `astro-docs` — the integration (default export)
- `astro-docs/loaders` — `docsLoader`, `bookLoader`
- `astro-docs/schema` — `docsSchema`, `bookSchema`, config/sidebar schemas
- `astro-docs/components` — `Callout`, `Page`, and individual components
- `astro-docs/types` — `RouteData`, `ResolvedSidebarItem`, and more

## License

MIT © Shravan Goswami
