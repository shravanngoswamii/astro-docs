import type { Breadcrumb } from "../types";

export function humanize(slug: string): string {
	return slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Builds a breadcrumb trail from a URL path and the current page title.
 * Intermediate segments link to their path; the final crumb is the page title.
 * When `validHrefs` is provided, a segment is only linked if a real page exists
 * there — otherwise it renders as a non-linked label (avoids 404 breadcrumbs).
 */
export function buildBreadcrumbs(
	currentPath: string,
	currentTitle: string,
	validHrefs?: ReadonlySet<string>,
): Breadcrumb[] {
	const segments = currentPath
		.replace(/^\/|\/$/g, "")
		.split("/")
		.filter(Boolean);
	const crumbs: Breadcrumb[] = [];

	let accumulated = "";
	for (let i = 0; i < segments.length - 1; i++) {
		accumulated += `/${segments[i]}`;
		const linkable = !validHrefs || validHrefs.has(accumulated);
		crumbs.push({
			label: humanize(segments[i]),
			href: linkable ? accumulated : undefined,
		});
	}

	crumbs.push({ label: currentTitle });
	return crumbs;
}

export type { Breadcrumb };
