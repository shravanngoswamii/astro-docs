import { describe, expect, it } from "vitest";
import { rehypeHeadingLinks } from "../src/markdown/heading-links";

function h(tagName: string, properties: any, text: string) {
	return {
		type: "element",
		tagName,
		properties,
		children: [{ type: "text", value: text }],
	};
}

function run(children: any[]) {
	const tree = { type: "root", children } as any;
	rehypeHeadingLinks()(tree);
	return tree;
}

describe("rehypeHeadingLinks", () => {
	it("assigns an id when missing (docs mode, before Astro's id pass)", () => {
		const tree = run([h("h2", {}, "Getting Started")]);
		const heading = tree.children[0];
		expect(heading.properties.id).toBe("getting-started");
		const anchor = heading.children.at(-1);
		expect(anchor.tagName).toBe("a");
		expect(anchor.properties.href).toBe("#getting-started");
		expect(heading.properties.className).toContain("docs-heading");
	});

	it("respects an already-pinned id (book mode)", () => {
		const tree = run([h("h2", { id: "scaling" }, "1.2 Scaling")]);
		expect(tree.children[0].properties.id).toBe("scaling");
		expect(tree.children[0].children.at(-1).properties.href).toBe("#scaling");
	});

	it("normalizes a string className instead of spreading its characters", () => {
		const tree = run([h("h2", { className: "existing-class" }, "A")]);
		expect(tree.children[0].properties.className).toEqual([
			"existing-class",
			"docs-heading",
		]);
	});

	it("dedupes generated ids", () => {
		const tree = run([h("h2", {}, "Intro"), h("h2", {}, "Intro")]);
		expect(tree.children[0].properties.id).toBe("intro");
		expect(tree.children[1].properties.id).toBe("intro-1");
	});

	it("skips headings with no text", () => {
		const tree = run([
			{ type: "element", tagName: "h2", properties: {}, children: [] },
		]);
		expect(tree.children[0].properties.id).toBeUndefined();
		expect(tree.children[0].children.length).toBe(0);
	});
});
