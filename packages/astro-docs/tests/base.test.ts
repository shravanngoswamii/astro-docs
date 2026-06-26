import { describe, expect, it } from "vitest";
import { joinBase } from "../src/utils/base";

describe("joinBase", () => {
	it("is a no-op at the site root", () => {
		expect(joinBase("/", "/docs/guide")).toBe("/docs/guide");
		expect(joinBase("/", "/")).toBe("/");
	});

	it("prefixes a subpath base (trailing slash from Astro)", () => {
		expect(joinBase("/astro-docs/", "/docs/guide")).toBe(
			"/astro-docs/docs/guide",
		);
		expect(joinBase("/astro-docs/", "/")).toBe("/astro-docs");
	});

	it("does not produce double slashes", () => {
		expect(joinBase("/astro-docs/", "/docs/guide")).not.toContain("//");
	});
});
