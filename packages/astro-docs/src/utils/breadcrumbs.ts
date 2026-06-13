import type { Breadcrumb } from "../types";

export function humanize(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds a breadcrumb trail from a URL path and the current page title.
 * Intermediate segments link to their path; the final crumb is the page title.
 */
export function buildBreadcrumbs(
  currentPath: string,
  currentTitle: string,
): Breadcrumb[] {
  const segments = currentPath.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = [];

  let accumulated = "";
  for (let i = 0; i < segments.length - 1; i++) {
    accumulated += `/${segments[i]}`;
    crumbs.push({ label: humanize(segments[i]), href: accumulated });
  }

  crumbs.push({ label: currentTitle });
  return crumbs;
}

export type { Breadcrumb };
