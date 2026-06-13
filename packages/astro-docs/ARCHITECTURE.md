# astro-docs — architecture contract

This is the locked contract every file in the package follows. Read before editing.

## Identity

- Package name: `astro-docs`
- Default export (the integration): `import astroDocs from "astro-docs"`
- Component subpath: `astro-docs/components`, schema: `astro-docs/schema`, loaders: `astro-docs/loaders`, types: `astro-docs/types`, styles: `astro-docs/styles/*`
- Virtual modules (all under `virtual:astro-docs/`):
  - `virtual:astro-docs/config` — resolved user config object
  - `virtual:astro-docs/user-css` — user `customCss` imports, wrapped in `@layer docs.user`
  - `virtual:astro-docs/components/<Name>` — resolves to the user override or the default component
  - `virtual:astro-docs/pagefind-config` — pagefind options
- Locals: `Astro.locals.astroDocs` (resolved route data), `Astro.locals.t` (UI string getter)

## CSS layers (declared once, in `styles/layers.css`)

```
@layer docs.tokens, docs.reset, docs.theme, docs.components, docs.content, docs.utils;
```

- `docs.tokens` — only `--docs-*` custom properties + `[data-theme="dark"]` block
- `docs.reset` — box-sizing/margin reset
- `docs.theme` — preset skin mapping tokens to look (empty when `theme: "none"`)
- `docs.components` — `.docs-*` component rules
- `docs.content` — `.docs-content` prose typography
- `docs.utils` — small utilities (sr-only etc.)

User `customCss` is imported **unlayered** (via `virtual:astro-docs/user-css`, plain JS `import "x.css"`). Unlayered CSS always beats layered CSS in the cascade, so the user's own site styles win unconditionally — this is the Starlight-proven mechanism and the #1 differentiator. `Page.astro` imports `layers.css` first to fix layer order, then framework layers, then `virtual:astro-docs/user-css` last.

Token prefix is `--docs-*`. Core tokens: `--docs-color-bg`, `--docs-color-text`, `--docs-color-muted`, `--docs-color-border`, `--docs-color-accent`, `--docs-color-code-bg`, `--docs-color-sidebar-bg`, `--docs-color-sidebar-active-bg`, `--docs-sidebar-width`, `--docs-toc-width`, `--docs-content-max-width`, `--docs-font-body`, `--docs-font-mono`, `--docs-font-ui`, `--docs-font-size-base`, `--docs-line-height`, `--docs-border-radius`.

## Route data shape (`Astro.locals.astroDocs`)

```ts
interface RouteData {
  entry: DocsEntry;                  // the content entry
  id: string;                        // entry id
  slug: string;                      // url slug (no base)
  url: string;                       // full path incl. base
  kind: "docs" | "book";
  title: string;
  headings: MarkdownHeading[];
  sidebar: ResolvedSidebarItem[];    // fully built, isCurrent flags set
  toc: TocItem[] | undefined;        // undefined when disabled / too few
  pagination: { prev?: SidebarLink; next?: SidebarLink };
  breadcrumbs: Breadcrumb[];
  editUrl: string | undefined;
  lastUpdated: Date | undefined;
  // book-only:
  book?: { part?: string; chapterNumber?: number; numbering: NumberingRegistry };
}
```

## Resolved sidebar item (what components render)

```ts
type ResolvedSidebarItem =
  | { type: "link"; label: string; href: string; isCurrent: boolean; badge?: Badge; attrs?: Record<string, string|number|boolean> }
  | { type: "group"; label: string; collapsed: boolean; badge?: Badge; items: ResolvedSidebarItem[]; hasCurrent: boolean };
```

## Component contract

- Every overridable component reads what it needs from `Astro.locals.astroDocs` and `Astro.props`. No global imports of config (use `virtual:astro-docs/config` only in the layout/Head).
- Default components live in `src/components/`. Users override via `components: { Sidebar: "./src/MySidebar.astro" }` in config.
- The layout composes components through `virtual:astro-docs/components/<Name>` so overrides resolve transparently.
- Overridable names: Head, ThemeProvider, SkipLink, PageFrame, Header, SiteTitle, Logo, Search, SocialIcons, ThemeSelect, Sidebar, TableOfContents, MobileTableOfContents, Banner, Breadcrumbs, PageTitle, MarkdownContent, Footer, LastUpdated, Pagination, EditLink, Callout.

## Class names (stable API — themes target these)

`.docs-body .docs-layout .docs-sidebar .docs-main .docs-content .docs-toc .docs-breadcrumbs .docs-pagination .docs-callout .docs-header .docs-footer .docs-sidebar-link .docs-sidebar-link--current .docs-sidebar-group .docs-search`

## Hard rules

- Zero client JS by default. Only exceptions, each opt-in: dark-mode no-flash script (`colorScheme !== "light"`), search modal (lazy), course progress (phase 3).
- `colorScheme` default is `"light"` (paper ethos, zero JS). Dark fully implemented, opt-in via `"dark"`/`"both"`.
- TypeScript strict. Minimal comments (only non-obvious WHY).
- Reuse existing components/utils where the spec says; generalize, don't rewrite.
