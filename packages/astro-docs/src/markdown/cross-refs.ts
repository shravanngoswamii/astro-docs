import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Root } from "mdast";

interface RefEntry {
  kind: "figure" | "table" | "section" | "equation";
  number: string;
  href: string;
  text: string;
}

const KIND_LABELS: Record<RefEntry["kind"], string> = {
  figure: "Figure",
  table: "Table",
  section: "Section",
  equation: "Equation",
};

const PREFIX_KIND: Record<string, RefEntry["kind"]> = {
  fig: "figure",
  tbl: "table",
  sec: "section",
  eq: "equation",
};

// Hyphen (not colon) so references never collide with remark-directive's `:name` syntax.
const REF_PATTERN = /@(fig|tbl|sec|eq)-([A-Za-z0-9_-]+)/g;

function textOf(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

/**
 * remark plugin (book mode): numbers figures/tables and headings, then resolves
 * `@fig:id` / `@sec:id` / `@tbl:id` references to numbered links. All build-time.
 */
export function remarkCrossReferences() {
  return (tree: Root, file: any) => {
    const frontmatter = file?.data?.astro?.frontmatter ?? {};
    const chapter: number | undefined = frontmatter.chapter;
    const numberSections: boolean = frontmatter.numberSections ?? false;
    const prefix = chapter != null ? `${chapter}.` : "";

    const registry: Record<string, RefEntry> = {};
    const counters = { figure: 0, table: 0, equation: 0 };
    const slugger = new GithubSlugger();
    const sectionCounters = [0, 0, 0, 0, 0, 0];

    // Pass 1: number labeled directives and headings.
    visit(tree, (node: any) => {
      if (node.type === "containerDirective" || node.type === "leafDirective") {
        const kind = (
          { figure: "figure", table: "table", equation: "equation" } as const
        )[node.name as "figure" | "table" | "equation"];
        if (!kind) return;
        const id = node.attributes?.id;
        counters[kind] += 1;
        const number = `${prefix}${counters[kind]}`;
        const domId = id ? `${node.name}-${id}` : `${node.name}-${counters[kind]}`;
        const caption = node.children?.[0]?.data?.directiveLabel
          ? textOf(node.children[0])
          : "";

        if (id) {
          registry[`${shortPrefix(kind)}-${id}`] = {
            kind,
            number,
            href: `#${domId}`,
            text: caption,
          };
        }

        const bodyChildren = node.children?.[0]?.data?.directiveLabel
          ? node.children.slice(1)
          : (node.children ?? []);
        const tag = kind === "table" ? "figure" : kind === "equation" ? "div" : "figure";
        Object.assign(node, {
          type: "paragraph",
          data: {
            hName: tag,
            hProperties: { id: domId, className: [`docs-${kind}`] },
          },
          children: [
            ...bodyChildren,
            {
              type: "paragraph",
              data: { hName: "figcaption", hProperties: { className: ["docs-figcaption"] } },
              children: [
                { type: "strong", children: [{ type: "text", value: `${KIND_LABELS[kind]} ${number}. ` }] },
                { type: "text", value: caption },
              ],
            },
          ],
        });
      }

      if (node.type === "heading" && node.depth >= 1) {
        const raw = textOf(node);
        const slug = slugger.slug(raw);
        // Pin the id from the original text so the numeric prefix below never
        // shifts it, and so section references resolve to a stable anchor.
        node.data = node.data ?? {};
        node.data.hProperties = { ...(node.data.hProperties ?? {}), id: slug };
        let number = "";
        if (numberSections && node.depth >= 2) {
          const level = node.depth - 2;
          sectionCounters[level] += 1;
          for (let i = level + 1; i < sectionCounters.length; i++) sectionCounters[i] = 0;
          const parts = sectionCounters.slice(0, level + 1);
          number = `${prefix}${parts.join(".")}`;
          node.children.unshift({ type: "text", value: `${number} ` });
        }
        registry[`sec-${slug}`] = {
          kind: "section",
          number: number || raw,
          href: `#${slug}`,
          text: raw,
        };
      }
    });

    // Pass 2: resolve references in text nodes.
    visit(tree, "text", (node: any, index, parent) => {
      if (!parent || index == null) return;
      REF_PATTERN.lastIndex = 0;
      if (!REF_PATTERN.test(node.value)) return;
      REF_PATTERN.lastIndex = 0;

      const newNodes: any[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = REF_PATTERN.exec(node.value)) !== null) {
        const [full, p, id] = m;
        const entry = registry[`${p}-${id}`];
        if (m.index > last) {
          newNodes.push({ type: "text", value: node.value.slice(last, m.index) });
        }
        if (entry) {
          const kind = PREFIX_KIND[p];
          const label =
            entry.number && /\d/.test(entry.number)
              ? `${KIND_LABELS[kind]} ${entry.number}`
              : entry.text;
          newNodes.push({
            type: "link",
            url: entry.href,
            data: { hProperties: { className: ["docs-xref"] } },
            children: [{ type: "text", value: label }],
          });
        } else {
          newNodes.push({ type: "text", value: full });
        }
        last = m.index + full.length;
      }
      if (last < node.value.length) {
        newNodes.push({ type: "text", value: node.value.slice(last) });
      }
      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
}

function shortPrefix(kind: RefEntry["kind"]): string {
  return kind === "figure" ? "fig" : kind === "table" ? "tbl" : kind === "equation" ? "eq" : "sec";
}
