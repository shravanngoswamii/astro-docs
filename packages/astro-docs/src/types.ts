import type { MarkdownHeading } from "astro";

export type ContentKind = "docs" | "book";

export type BadgeVariant =
  | "default"
  | "note"
  | "tip"
  | "caution"
  | "danger"
  | "success";

export type Badge = { text: string; variant: BadgeVariant; class?: string };

export type LinkAttrs = Record<string, string | number | boolean>;

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface TocItem {
  depth: number;
  slug: string;
  text: string;
}

/** A leaf link, used for flattening and prev/next navigation. */
export interface NavLink {
  label: string;
  href: string;
}

export type ResolvedSidebarItem =
  | {
      type: "link";
      label: string;
      href: string;
      isCurrent: boolean;
      badge?: Badge;
      attrs?: LinkAttrs;
    }
  | {
      type: "group";
      label: string;
      collapsed: boolean;
      badge?: Badge;
      items: ResolvedSidebarItem[];
      hasCurrent: boolean;
    };

export interface FigureNumber {
  kind: "figure" | "table" | "equation" | "section";
  number: string;
  label: string;
  href: string;
}

/** Build-time registry of numbered, cross-referenceable elements for a book. */
export type NumberingRegistry = Record<string, FigureNumber>;

export interface BookRouteInfo {
  part?: string;
  chapterNumber?: number;
}

export interface RouteData {
  id: string;
  slug: string;
  url: string;
  kind: ContentKind;
  title: string;
  description?: string;
  headings: MarkdownHeading[];
  sidebar: ResolvedSidebarItem[];
  toc: TocItem[] | undefined;
  pagination: { prev?: NavLink; next?: NavLink };
  breadcrumbs: Breadcrumb[];
  editUrl: string | undefined;
  lastUpdated: Date | undefined;
  book?: BookRouteInfo;
}

export type OverridableComponentName =
  | "Head"
  | "ThemeProvider"
  | "SkipLink"
  | "PageFrame"
  | "Header"
  | "SiteTitle"
  | "Logo"
  | "Search"
  | "SocialIcons"
  | "ThemeSelect"
  | "Sidebar"
  | "TableOfContents"
  | "MobileTableOfContents"
  | "Banner"
  | "Breadcrumbs"
  | "PageTitle"
  | "MarkdownContent"
  | "Footer"
  | "LastUpdated"
  | "Pagination"
  | "EditLink"
  | "Callout";
