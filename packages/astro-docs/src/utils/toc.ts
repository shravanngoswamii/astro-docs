import type { MarkdownHeading } from "astro";
import type { TocItem } from "../types";

export type TocConfig =
	| boolean
	| { minHeadingLevel: number; maxHeadingLevel: number };

const DEFAULT_RANGE = { minHeadingLevel: 2, maxHeadingLevel: 3 };

/**
 * Filters Markdown headings into a TOC, honoring the configured heading range.
 * Returns undefined when TOC is disabled or there are fewer than two entries.
 */
export function buildToc(
	headings: MarkdownHeading[],
	config: TocConfig | undefined,
): TocItem[] | undefined {
	if (config === false) return undefined;
	const range = config && typeof config === "object" ? config : DEFAULT_RANGE;

	const items = headings
		.filter(
			(h) =>
				h.depth >= range.minHeadingLevel && h.depth <= range.maxHeadingLevel,
		)
		.map((h) => ({ depth: h.depth, slug: h.slug, text: h.text }));

	return items.length >= 2 ? items : undefined;
}
