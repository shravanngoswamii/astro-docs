import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";
import type { Root } from "mdast";

interface RefEntry {
  kind: "figure" | "table" | "section" | "equation";
  number: string;
  href: string;
  text: string;
  numbered: boolean;
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

function shortPrefix(kind: RefEntry["kind"]): string {
  return kind === "figure" ? "fig" : kind === "table" ? "tbl" : kind === "equation" ? "eq" : "sec";
}

function textOf(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

/**
 * remark plugin (book mode): numbers figures/tables and headings, then resolves
 * `@fig-id` / `@sec-id` / `@tbl-id` references to numbered links. All build-time.
 */
export function remarkCrossReferences() {
  // Local regex so the /g lastIndex is never shared across files.
  const refPattern = /@(fig|tbl|sec|eq)-([A-Za-z0-9_-]+)/g;

  return (tree: Root, file: any) => {
    const frontmatter = file?.data?.astro?.frontmatter ?? {};
    const chapter: number | undefined = frontmatter.chapter;
    const numberSections: boolean = frontmatter.numberSections ?? false;
    const prefix = chapter != null ? `${chapter}.` : "";

    const registry: Record<string, RefEntry> = {};
    const counters = { figure: 0, table: 0, equation: 0 };
    const slugger = new GithubSlugger();
    const sectionCounters = [0, 0, 0, 0, 0, 0];

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
        const hasLabel = node.children?.[0]?.data?.directiveLabel;
        const caption = hasLabel ? textOf(node.children[0]) : "";

        if (id) {
          registry[`${shortPrefix(kind)}-${id}`] = {
            kind,
            number,
            href: `#${domId}`,
            text: caption,
            numbered: true,
          };
        }

        const bodyChildren = hasLabel ? node.children.slice(1) : (node.children ?? []);
        const tag = kind === "equation" ? "div" : "figure";
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
        const raw = textOf(node).trim();
        if (!raw) return;
        const slug = slugger.slug(raw);
        node.data = node.data ?? {};
        node.data.hProperties = { ...(node.data.hProperties ?? {}), id: slug };

        let number = "";
        let numbered = false;
        if (numberSections && node.depth >= 2) {
          const level = node.depth - 2;
          // Promote skipped ancestor levels so we never emit a "1.0.1".
          for (let i = 0; i < level; i++) {
            if (sectionCounters[i] === 0) sectionCounters[i] = 1;
          }
          sectionCounters[level] += 1;
          for (let i = level + 1; i < sectionCounters.length; i++) sectionCounters[i] = 0;
          number = `${prefix}${sectionCounters.slice(0, level + 1).join(".")}`;
          numbered = true;
          node.children.unshift({ type: "text", value: `${number} ` });
        }
        registry[`sec-${slug}`] = {
          kind: "section",
          number: number || raw,
          href: `#${slug}`,
          text: raw,
          numbered,
        };
      }
    });

    visit(tree, "text", (node: any, index, parent) => {
      if (!parent || index == null) return;
      refPattern.lastIndex = 0;
      if (!refPattern.test(node.value)) return;
      refPattern.lastIndex = 0;

      const newNodes: any[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = refPattern.exec(node.value)) !== null) {
        const [full, p, id] = m;
        const entry = registry[`${p}-${id}`];
        if (m.index > last) {
          newNodes.push({ type: "text", value: node.value.slice(last, m.index) });
        }
        if (entry) {
          const kind = PREFIX_KIND[p];
          const label = entry.numbered ? `${KIND_LABELS[kind]} ${entry.number}` : entry.text;
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
