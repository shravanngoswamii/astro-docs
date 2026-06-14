import { describe, expect, it } from "vitest";
import { remarkAsides } from "../src/markdown/asides";

function run(tree: any) {
	remarkAsides()(tree);
	return tree;
}

function para(text: string) {
	return { type: "paragraph", children: [{ type: "text", value: text }] };
}

describe("remarkAsides", () => {
	it("transforms a ::: container directive into a callout", () => {
		const node: any = {
			type: "containerDirective",
			name: "tip",
			children: [para("Use the order field.")],
		};
		run({ type: "root", children: [node] });

		expect(node.data.hName).toBe("aside");
		expect(node.data.hProperties.className).toContain("docs-callout--tip");
		expect(node.children[0].data.hProperties.className).toContain(
			"docs-callout-title",
		);
		expect(node.children[0].children[0].value).toBe("Tip");
	});

	it("uses a directive label as the title", () => {
		const node: any = {
			type: "containerDirective",
			name: "note",
			children: [
				{
					type: "paragraph",
					data: { directiveLabel: true },
					children: [{ type: "text", value: "Heads up" }],
				},
				para("Body text."),
			],
		};
		run({ type: "root", children: [node] });
		expect(node.children[0].children[0].value).toBe("Heads up");
	});

	it("transforms a GitHub-style [!WARNING] blockquote", () => {
		const node: any = {
			type: "blockquote",
			children: [para("[!WARNING] Be careful here.")],
		};
		run({ type: "root", children: [node] });

		expect(node.data.hName).toBe("aside");
		expect(node.data.hProperties.className).toContain("docs-callout--warning");
		// marker stripped from the body text
		const body = node.children[1];
		expect(body.children[0].children[0].value).toBe("Be careful here.");
	});

	it("ignores unknown directive names", () => {
		const node: any = {
			type: "containerDirective",
			name: "unknown",
			children: [para("x")],
		};
		run({ type: "root", children: [node] });
		expect(node.data?.hName).toBeUndefined();
	});
});
