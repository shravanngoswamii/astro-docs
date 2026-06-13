import { describe, it, expect } from "vitest";
import {
  buildSidebar,
  flattenSidebar,
  getPrevNext,
  normalizeSlug,
  type SidebarEntry,
} from "../src/utils/sidebar";

function entry(id: string, order?: number, extra: Partial<SidebarEntry["data"]> = {}): SidebarEntry {
  return {
    id,
    data: { title: id, sidebar: { order, hidden: false }, ...extra },
  };
}

const entries: SidebarEntry[] = [
  entry("index", 0),
  entry("guides/getting-started", 1),
  entry("guides/configuration", 2),
  entry("reference/cli", 1),
];

describe("normalizeSlug", () => {
  it("strips trailing index", () => {
    expect(normalizeSlug("index")).toBe("");
    expect(normalizeSlug("guides/index")).toBe("guides");
    expect(normalizeSlug("guides/setup")).toBe("guides/setup");
  });
});

describe("buildSidebar (autogenerate)", () => {
  it("builds groups from directories and sorts by order", () => {
    const tree = buildSidebar({ entries, base: "/docs", currentSlug: "guides/getting-started" });
    // index link first, then guides + reference groups
    const labels = tree.map((i) => i.label);
    expect(labels).toContain("Guides");
    expect(labels).toContain("Reference");
    const guides = tree.find((i) => i.label === "Guides");
    expect(guides?.type).toBe("group");
    if (guides?.type === "group") {
      expect(guides.items.map((i) => i.label)).toEqual([
        "guides/getting-started",
        "guides/configuration",
      ]);
      expect(guides.hasCurrent).toBe(true);
    }
  });

  it("marks the current link", () => {
    const tree = buildSidebar({ entries, base: "/docs", currentSlug: "reference/cli" });
    const flat = flattenSidebar(tree);
    expect(flat.some((l) => l.href === "/docs/reference/cli")).toBe(true);
  });

  it("hides hidden and draft entries", () => {
    const withHidden = [
      ...entries,
      entry("secret", 5, { sidebar: { hidden: true } }),
      entry("wip", 6, { draft: true }),
    ];
    const flat = flattenSidebar(
      buildSidebar({ entries: withHidden, base: "/docs", currentSlug: "" }),
    );
    expect(flat.some((l) => l.href.endsWith("/secret"))).toBe(false);
    expect(flat.some((l) => l.href.endsWith("/wip"))).toBe(false);
  });
});

describe("manual sidebar config", () => {
  it("wraps autogenerate in a labeled group", () => {
    const tree = buildSidebar({
      config: [
        { slug: "index", label: "Home" },
        { label: "Guides", autogenerate: { directory: "guides" } },
      ],
      entries,
      base: "/docs",
      currentSlug: "guides/configuration",
    });
    expect(tree[0]).toMatchObject({ type: "link", label: "Home", href: "/docs" });
    expect(tree[1]).toMatchObject({ type: "group", label: "Guides" });
  });

  it("resolves internal links by slug with title fallback", () => {
    const tree = buildSidebar({
      config: [{ slug: "reference/cli" }],
      entries,
      base: "/docs",
      currentSlug: "",
    });
    expect(tree[0]).toMatchObject({
      type: "link",
      label: "reference/cli",
      href: "/docs/reference/cli",
    });
  });
});

describe("getPrevNext", () => {
  it("returns neighbors in flattened order", () => {
    const tree = buildSidebar({ entries, base: "/docs", currentSlug: "" });
    const { prev, next } = getPrevNext(tree, "/docs/guides/getting-started");
    expect(prev?.href).toBe("/docs");
    expect(next?.href).toBe("/docs/guides/configuration");
  });
});
