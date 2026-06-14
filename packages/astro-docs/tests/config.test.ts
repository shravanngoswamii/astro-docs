import { describe, expect, it } from "vitest";
import { UserConfigSchema } from "../src/schema/config";
import { buildBreadcrumbs } from "../src/utils/breadcrumbs";
import { buildToc } from "../src/utils/toc";

describe("UserConfigSchema", () => {
	it("applies sensible defaults", () => {
		const cfg = UserConfigSchema.parse({ title: "My Docs" });
		expect(cfg.theme).toBe("default");
		expect(cfg.colorScheme).toBe("light");
		expect(cfg.pagination).toBe(true);
		expect(cfg.customCss).toEqual([]);
		expect(cfg.expressiveCode).toBe(true);
	});

	it("requires a title", () => {
		expect(() => UserConfigSchema.parse({})).toThrow();
	});

	it("normalizes routeMiddleware to an array", () => {
		const cfg = UserConfigSchema.parse({
			title: "x",
			routeMiddleware: "./mw.ts",
		});
		expect(cfg.routeMiddleware).toEqual(["./mw.ts"]);
	});
});

describe("buildBreadcrumbs", () => {
	it("links intermediate segments and ends with the title", () => {
		const crumbs = buildBreadcrumbs("/docs/guides/setup", "Setup Guide");
		expect(crumbs).toEqual([
			{ label: "Docs", href: "/docs" },
			{ label: "Guides", href: "/docs/guides" },
			{ label: "Setup Guide" },
		]);
	});
});

describe("buildToc", () => {
	const headings = [
		{ depth: 1, slug: "title", text: "Title" },
		{ depth: 2, slug: "a", text: "A" },
		{ depth: 3, slug: "a1", text: "A1" },
		{ depth: 4, slug: "deep", text: "Deep" },
	];

	it("honors the default heading range and minimum count", () => {
		const toc = buildToc(headings, { minHeadingLevel: 2, maxHeadingLevel: 3 });
		expect(toc?.map((t) => t.slug)).toEqual(["a", "a1"]);
	});

	it("returns undefined when disabled", () => {
		expect(buildToc(headings, false)).toBeUndefined();
	});

	it("returns undefined with fewer than two entries", () => {
		expect(
			buildToc([{ depth: 2, slug: "x", text: "X" }], true),
		).toBeUndefined();
	});
});
