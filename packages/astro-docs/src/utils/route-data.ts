import type { MarkdownHeading } from "astro";
import type { AstroDocsConfig } from "../schema/config";
import type { ContentKind, RouteData } from "../types";
import {
  buildSidebar,
  normalizeSlug,
  type SidebarEntry,
} from "./sidebar";
import { flattenSidebar, getPrevNext } from "./sidebar";
import { buildToc, type TocConfig } from "./toc";
import { buildBreadcrumbs } from "./breadcrumbs";

interface EntryLike {
  id: string;
  filePath?: string;
  data: {
    title: string;
    description?: string;
    tableOfContents?: TocConfig;
    editUrl?: string | boolean;
    lastUpdated?: boolean | Date;
    sidebar: SidebarEntry["data"]["sidebar"];
    draft?: boolean;
    part?: string;
    chapter?: number;
  };
}

export interface BuildRouteDataParams {
  config: AstroDocsConfig;
  base: string;
  kind: ContentKind;
  entry: EntryLike;
  allEntries: EntryLike[];
  headings: MarkdownHeading[];
  /** Sidebar config for this collection; falls back to the global config sidebar. */
  sidebarConfig?: AstroDocsConfig["sidebar"];
}

function normalizeBase(base: string): string {
  return "/" + base.replace(/^\/+|\/+$/g, "");
}

function resolveEditUrl(
  config: AstroDocsConfig,
  entry: EntryLike,
): string | undefined {
  if (entry.data.editUrl === false) return undefined;
  if (typeof entry.data.editUrl === "string") return entry.data.editUrl;
  if (!config.editLink?.baseUrl || !entry.filePath) return undefined;
  const path = entry.filePath.replace(/^\/+/, "");
  return `${config.editLink.baseUrl.replace(/\/$/, "")}/${path}`;
}

function resolveLastUpdated(
  config: AstroDocsConfig,
  entry: EntryLike,
): Date | undefined {
  const fm = entry.data.lastUpdated;
  if (fm instanceof Date) return fm;
  if (fm === false) return undefined;
  // Git-derived dates are deferred; only explicit frontmatter dates show for now.
  return undefined;
}

export function buildRouteData(params: BuildRouteDataParams): RouteData {
  const { config, base, kind, entry, allEntries, headings, sidebarConfig } = params;
  const b = normalizeBase(base);
  const slug = normalizeSlug(entry.id);
  const url = slug ? `${b}/${slug}` : b;

  const sidebar = buildSidebar({
    config: sidebarConfig ?? config.sidebar,
    entries: allEntries as SidebarEntry[],
    base: b,
    currentSlug: slug,
  });

  const toc = buildToc(
    headings,
    entry.data.tableOfContents ?? (config.tableOfContents as TocConfig),
  );

  const pagination = config.pagination ? getPrevNext(sidebar, url) : {};
  const breadcrumbs = buildBreadcrumbs(url, entry.data.title);

  const data: RouteData = {
    id: entry.id,
    slug,
    url,
    kind,
    title: entry.data.title,
    description: entry.data.description,
    headings,
    sidebar,
    toc,
    pagination,
    breadcrumbs,
    editUrl: resolveEditUrl(config, entry),
    lastUpdated: config.lastUpdated ? resolveLastUpdated(config, entry) : undefined,
  };

  if (kind === "book") {
    data.book = {
      part: entry.data.part,
      chapterNumber: entry.data.chapter,
    };
  }

  return data;
}

export { flattenSidebar };
