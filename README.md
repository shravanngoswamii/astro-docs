# astro-paper-docs

A headless documentation framework for Astro. Handles sidebar, TOC, breadcrumbs, prev/next, and callouts. You control the CSS.

## Install

```sh
npm install astro-paper-docs
```

## Quick start

### 1. Define your content collection

```ts
// src/content.config.ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { docsSchema } from "astro-paper-docs";

const docs = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
  schema: docsSchema,
});

export const collections = { docs };
```

### 2. Create the dynamic route

```astro
---
// src/pages/docs/[...slug].astro
import { getCollection, render } from "astro:content";
import DocsLayout from "astro-paper-docs/src/components/DocsLayout.astro";
import { buildSidebar, getPrevNext, buildBreadcrumbs } from "astro-paper-docs";
import "astro-paper-docs/styles/default.css"; // optional — use your own CSS instead

export async function getStaticPaths() {
  const docs = await getCollection("docs", ({ data }) => !data.draft);
  const sidebar = buildSidebar(docs, "/docs");

  return docs.map((entry) => ({
    params: { slug: entry.id },
    props: { entry, sidebar },
  }));
}

const { entry, sidebar } = Astro.props;
const { Content, headings } = await render(entry);

const currentPath = `/docs/${entry.id}`;
const { prev, next } = getPrevNext(sidebar, currentPath);
const breadcrumbs = buildBreadcrumbs(currentPath, entry.data.title);
---

<DocsLayout
  title={entry.data.title}
  description={entry.data.description}
  {sidebar}
  {headings}
  {breadcrumbs}
  {prev}
  {next}
  {currentPath}
  tableOfContents={entry.data.tableOfContents}
>
  <Content />
</DocsLayout>
```

### 3. Write docs

```md
---
title: Getting Started
description: How to install and configure the thing.
sidebar:
  order: 1
  badge: New
---

Your content here.
```

## Frontmatter fields

| Field | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | required | Page title and `<h1>` |
| `description` | `string` | — | Meta description |
| `sidebar.label` | `string` | `title` | Override label in sidebar |
| `sidebar.order` | `number` | Infinity | Sort position in sidebar |
| `sidebar.hidden` | `boolean` | `false` | Exclude from sidebar |
| `sidebar.badge` | `string` | — | Small label next to sidebar link |
| `draft` | `boolean` | `false` | Exclude from build |
| `tags` | `string[]` | — | Tags (not rendered by default) |
| `tableOfContents` | `boolean` | `true` | Show/hide TOC for this page |

## Sidebar config

`buildSidebar` generates a flat sorted list. For nested groups, build it manually:

```ts
import type { SidebarItem } from "astro-paper-docs";

const sidebar: SidebarItem[] = [
  {
    type: "group",
    label: "Getting Started",
    items: [
      { type: "link", label: "Introduction", href: "/docs/intro" },
      { type: "link", label: "Installation", href: "/docs/install" },
    ],
  },
  { type: "link", label: "Configuration", href: "/docs/config" },
];
```

## Custom styling

Import `astro-paper-docs/styles/default.css` to get the paper aesthetic, then override any variable:

```css
:root {
  --docs-color-bg: #ffffff;
  --docs-font-body: system-ui, sans-serif;
  --docs-sidebar-width: 300px;
}
```

Or skip the default CSS entirely and target the class names yourself:

```css
.docs-body { ... }
.docs-layout { ... }
.docs-sidebar { ... }
.docs-content { ... }
.docs-sidebar-link--current { ... }
```

## Components

All components can be used standalone:

```astro
---
import Sidebar from "astro-paper-docs/src/components/Sidebar.astro";
import TOC from "astro-paper-docs/src/components/TOC.astro";
import Callout from "astro-paper-docs/src/components/Callout.astro";
---
```

### Callout (MDX)

```mdx
import Callout from "astro-paper-docs/src/components/Callout.astro";

<Callout type="warning">This is a warning.</Callout>
<Callout type="tip" title="Pro tip">Custom title here.</Callout>
```

Types: `note` `tip` `warning` `danger` `important`

## DocsLayout slots

| Slot | Location |
|---|---|
| `head` | Inside `<head>` — for fonts, extra meta |
| `header` | Top of `<body>` — for site nav |
| `sidebar-header` | Top of sidebar — for logo/site name |
| `sidebar-footer` | Bottom of sidebar — for version picker etc. |
| `footer` | Bottom of `<body>` |

## License

MIT
