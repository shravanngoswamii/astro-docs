export type Breadcrumb = {
  label: string;
  href?: string;
};

/**
 * Builds a breadcrumb trail from a URL path and the current page title.
 * Path segments are humanised (kebab-case → Title Case).
 */
export function buildBreadcrumbs(
  currentPath: string,
  currentTitle: string,
): Breadcrumb[] {
  const segments = currentPath.replace(/^\/|\/$/g, "").split("/");
  const crumbs: Breadcrumb[] = [];

  let accumulated = "";
  for (let i = 0; i < segments.length - 1; i++) {
    accumulated += `/${segments[i]}`;
    crumbs.push({
      label: humanise(segments[i]),
      href: accumulated,
    });
  }

  crumbs.push({ label: currentTitle });
  return crumbs;
}

function humanise(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
