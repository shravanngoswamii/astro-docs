import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

const HEADINGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

/**
 * rehype plugin: appends an anchor link to every heading that has an id.
 * The anchor is hidden from search and labelled for screen readers.
 */
export function rehypeHeadingLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (!HEADINGS.has(node.tagName)) return;
      const id = node.properties?.id;
      if (!id || typeof id !== "string") return;

      const classes = (node.properties.className as string[]) ?? [];
      node.properties.className = [...classes, "docs-heading"];

      const anchor: Element = {
        type: "element",
        tagName: "a",
        properties: {
          href: `#${id}`,
          className: ["docs-heading-anchor"],
          "aria-hidden": "true",
          tabindex: "-1",
          "data-pagefind-ignore": true,
        },
        children: [{ type: "text", value: "#" }],
      };
      node.children.push(anchor);
    });
  };
}
