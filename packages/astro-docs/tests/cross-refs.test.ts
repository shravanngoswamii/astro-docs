import { describe, it, expect } from "vitest";
import { remarkCrossReferences } from "../src/markdown/cross-refs";

function build() {
  const heading = {
    type: "heading",
    depth: 2,
    children: [{ type: "text", value: "Scaling" }],
  };
  const figure = {
    type: "containerDirective",
    name: "figure",
    attributes: { id: "overview" },
    children: [
      { type: "paragraph", data: { directiveLabel: true }, children: [{ type: "text", value: "The overview." }] },
      { type: "paragraph", children: [{ type: "text", value: "image" }] },
    ],
  };
  const refPara = {
    type: "paragraph",
    children: [{ type: "text", value: "See @fig-overview and @sec-scaling." }],
  };
  return { type: "root", children: [heading, figure, refPara] };
}

const file = { data: { astro: { frontmatter: { chapter: 1, numberSections: true } } } };

describe("remarkCrossReferences", () => {
  it("numbers headings and pins their id", () => {
    const tree: any = build();
    remarkCrossReferences()(tree as any, file);
    const heading = tree.children[0];
    expect(heading.data.hProperties.id).toBe("scaling");
    expect(heading.children[0].value).toBe("1.1 ");
  });

  it("numbers a figure and resolves @fig references to links", () => {
    const tree: any = build();
    remarkCrossReferences()(tree as any, file);

    const figure = tree.children[1];
    expect(figure.data.hName).toBe("figure");
    expect(figure.data.hProperties.id).toBe("figure-overview");

    const refPara = tree.children[2];
    const link = refPara.children.find((c: any) => c.type === "link");
    expect(link.url).toBe("#figure-overview");
    expect(link.children[0].value).toBe("Figure 1.1");
  });

  it("resolves @sec references using the section number", () => {
    const tree: any = build();
    remarkCrossReferences()(tree as any, file);
    const refPara = tree.children[2];
    const links = refPara.children.filter((c: any) => c.type === "link");
    const secLink = links.find((l: any) => l.url === "#scaling");
    expect(secLink.children[0].value).toBe("Section 1.1");
  });

  it("leaves unknown references as literal text", () => {
    const tree: any = {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", value: "See @fig-missing." }] }],
    };
    remarkCrossReferences()(tree as any, file);
    const text = tree.children[0].children.map((c: any) => c.value ?? "").join("");
    expect(text).toContain("@fig-missing");
  });
});
