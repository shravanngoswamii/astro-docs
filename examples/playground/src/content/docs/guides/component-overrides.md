---
title: Component Overrides
description: Replace any built-in UI component with your own.
sidebar:
  order: 4
---

When CSS isn't enough, you can replace any built-in component with your own
`.astro` file. The framework resolves overrides transparently — wherever it would
render its own `Header`, it renders yours instead.

## Overriding a component

Map a component name to a file path in your config:

```js title="astro.config.mjs"
astroDocs({
  title: "My Docs",
  components: {
    Header: "./src/overrides/Header.astro",
    Footer: "./src/overrides/Footer.astro",
    Sidebar: "./src/overrides/Sidebar.astro",
  },
});
```

Paths are resolved from your project root.

## Reading the current page

Every override receives the fully-resolved route data on `Astro.locals.astroDocs`.
You don't pass props down — read what you need:

```astro title="src/overrides/Footer.astro"
---
const route = Astro.locals.astroDocs;
---

<footer class="docs-footer">
  <p>Last edited on the “{route.title}” page.</p>
  {route.editUrl && <a href={route.editUrl}>Edit this page</a>}
</footer>
```

The `route` object (`RouteData`, importable from `astro-docs/types`) includes:

| Field | Type | Description |
| --- | --- | --- |
| `title` | `string` | Current page title |
| `kind` | `"docs" \| "book"` | Collection kind |
| `url` | `string` | Current page URL |
| `headings` | `MarkdownHeading[]` | Raw headings |
| `toc` | `TocItem[] \| undefined` | Filtered table of contents |
| `sidebar` | `ResolvedSidebarItem[]` | Fully-built sidebar tree |
| `pagination` | `{ prev?, next? }` | Prev/next links |
| `breadcrumbs` | `Breadcrumb[]` | Breadcrumb trail |
| `editUrl` | `string \| undefined` | Edit-this-page URL |
| `lastUpdated` | `Date \| undefined` | Last-updated date |

## Reusing built-ins inside your override

Want to wrap a default rather than rewrite it? Import the original from
`astro-docs/components`:

```astro title="src/overrides/Header.astro"
---
import { Callout } from "astro-docs/components";
const route = Astro.locals.astroDocs;
---

<header class="docs-header">
  <a class="docs-header-title" href="/">My Project</a>
  <div class="docs-header-spacer"></div>
  <!-- your custom actions -->
</header>
```

## Overridable components

```
Head            ThemeProvider   SkipLink        PageFrame
Header          MobileMenuToggle SiteTitle      Logo
Search          SocialIcons     ThemeSelect     Sidebar
TableOfContents MobileTableOfContents           Banner
Breadcrumbs     PageTitle       MarkdownContent Footer
LastUpdated     Pagination      EditLink        Callout
```

:::note
`Banner` is intentionally empty by default — it's a built-in extension point.
Override it to show an announcement bar on every page.
:::

:::warning
Overrides receive data via `Astro.locals.astroDocs`, not Astro slots. Keep the
`.docs-*` class names if you want your override to inherit the framework's CSS.
:::
