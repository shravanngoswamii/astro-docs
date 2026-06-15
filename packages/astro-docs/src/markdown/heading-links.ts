import GithubSlugger from "github-slugger";
import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function textContent(node: ElementContent | Element): string {
	if (node.type === "text") return node.value;
	if ("children" in node && Array.isArray(node.children)) {
		return node.children.map(textContent).join("");
	}
	return "";
}

function toClassList(value: unknown): string[] {
	if (Array.isArray(value)) return value as string[];
	if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
	return [];
}

/**
 * rehype plugin: ensures every heading has an id, then appends an anchor link.
 * This runs before Astro's own heading-id pass, so we assign ids ourselves
 * (mirroring github-slugger) to keep them consistent with the generated TOC.
 */
export function rehypeHeadingLinks() {
	return (tree: Root) => {
		const slugger = new GithubSlugger();
		visit(tree, "element", (node: Element) => {
			if (!HEADINGS.has(node.tagName)) return;

			node.properties ??= {};
			let id = node.properties.id;
			if (typeof id !== "string" || id === "") {
				const text = textContent(node).trim();
				if (!text) return;
				id = slugger.slug(text);
				node.properties.id = id;
			} else {
				// Reserve already-pinned ids so generated ones don't collide with them.
				slugger.slug(id);
			}

			node.properties.className = [
				...toClassList(node.properties.className),
				"docs-heading",
			];

			// No text child — the glyph comes from CSS so Astro's heading-text
			// collection (used for the TOC) stays clean.
			node.children.push({
				type: "element",
				tagName: "a",
				properties: {
					href: `#${id}`,
					className: ["docs-heading-anchor"],
					"aria-label": `Link to ${textContent(node).trim()}`,
					tabindex: "-1",
					"data-pagefind-ignore": true,
				},
				children: [],
			});
		});
	};
}
