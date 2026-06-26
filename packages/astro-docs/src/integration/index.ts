/// <reference path="../virtual.d.ts" />

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import type { AstroIntegration } from "astro";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { remarkAsides } from "../markdown/asides";
import { remarkCrossReferences } from "../markdown/cross-refs";
import { rehypeHeadingLinks } from "../markdown/heading-links";
import {
	type AstroDocsConfig,
	type AstroDocsUserConfig,
	UserConfigSchema,
} from "../schema/config";
import type { OverridableComponentName } from "../types";
import { docsExpressiveCode } from "./code";
import { runPagefind } from "./search";
import { astroDocsVitePlugin } from "./vite-plugin";

export interface CollectionMount {
	kind: "docs" | "book";
	base?: string;
	/** Per-collection sidebar; falls back to the top-level `sidebar`, then autogenerate. */
	sidebar?: AstroDocsUserConfig["sidebar"];
}

export interface AstroDocsOptions extends AstroDocsUserConfig {
	/** Map of content collection name -> mount config. Default: { docs: { kind: "docs", base: "/" } }. */
	collections?: Record<string, CollectionMount>;
}

export const COMPONENT_NAMES: readonly OverridableComponentName[] = [
	"Head",
	"ThemeProvider",
	"SkipLink",
	"PageFrame",
	"Header",
	"MobileMenuToggle",
	"SiteTitle",
	"Logo",
	"Search",
	"SocialIcons",
	"ThemeSelect",
	"Sidebar",
	"TableOfContents",
	"MobileTableOfContents",
	"Banner",
	"Breadcrumbs",
	"PageTitle",
	"MarkdownContent",
	"Footer",
	"LastUpdated",
	"Pagination",
	"EditLink",
	"Callout",
];

function normalizeBase(base: string): string {
	const trimmed = base.replace(/^\/+|\/+$/g, "");
	return trimmed ? `/${trimmed}` : "/";
}

export default function astroDocs(options: AstroDocsOptions): AstroIntegration {
	const { collections: rawCollections, ...userConfig } = options;
	const here = dirname(fileURLToPath(import.meta.url));
	const srcDir = resolve(here, "..");

	const collections = Object.fromEntries(
		Object.entries(
			rawCollections ?? { docs: { kind: "docs" as const, base: "/" } },
		).map(([name, c]) => [
			name,
			{ kind: c.kind, base: normalizeBase(c.base ?? "/"), sidebar: c.sidebar },
		]),
	);

	return {
		name: "astro-docs",
		hooks: {
			"astro:config:setup": ({ config, injectRoute, updateConfig, logger }) => {
				let parsed: AstroDocsConfig;
				try {
					parsed = UserConfigSchema.parse(userConfig);
				} catch (err) {
					logger.error("Invalid astro-docs config.");
					throw err;
				}

				const pagefindOptions =
					typeof parsed.pagefind === "object" ? parsed.pagefind : {};

				// Sub-integrations, added only when not already present.
				const integrations: AstroIntegration[] = [];
				const existing = config.integrations.map((i) => i.name);

				if (
					parsed.expressiveCode !== false &&
					!existing.includes("astro-expressive-code")
				) {
					integrations.push(...docsExpressiveCode(parsed.expressiveCode));
				}
				if (parsed.sitemap && !existing.includes("@astrojs/sitemap")) {
					integrations.push(sitemap());
				}
				if (!existing.includes("@astrojs/mdx")) {
					integrations.push(mdx());
				}
				const selfIndex = config.integrations.findIndex(
					(i) => i.name === "astro-docs",
				);
				config.integrations.splice(
					selfIndex + 1 || config.integrations.length,
					0,
					...integrations,
				);

				injectRoute({
					pattern: "[...slug]",
					entrypoint: fileURLToPath(
						new URL("../routes/index.astro", import.meta.url),
					),
					prerender: true,
				});
				if (!parsed.disable404Route) {
					injectRoute({
						pattern: "404",
						entrypoint: fileURLToPath(
							new URL("../routes/404.astro", import.meta.url),
						),
						prerender: true,
					});
				}

				// Astro 7's default Markdown processor (Sätteri) doesn't run
				// remark/rehype plugins, so opt into the unified processor and add
				// ours to it. unified() keeps GFM/smart-punctuation/highlighting.
				const processor: any = unified();
				const hasBook = Object.values(collections).some(
					(c) => c.kind === "book",
				);
				processor.options.remarkPlugins.push(remarkDirective, remarkAsides);
				if (hasBook)
					processor.options.remarkPlugins.push(remarkCrossReferences);
				if (parsed.math) {
					processor.options.remarkPlugins.push(remarkMath);
					processor.options.rehypePlugins.push([rehypeKatex, {}]);
				}
				processor.options.rehypePlugins.push(rehypeHeadingLinks);

				updateConfig({
					vite: {
						plugins: [
							astroDocsVitePlugin({
								config: parsed,
								collections,
								root: fileURLToPath(config.root),
								srcDir,
								componentNames: COMPONENT_NAMES,
								pagefindOptions,
							}),
						],
					},
					markdown: { processor },
					scopedStyleStrategy: "where",
				});
			},

			"astro:config:done": ({ injectTypes }) => {
				injectTypes({
					filename: "astro-docs.d.ts",
					content: `declare namespace App {
  interface Locals {
    astroDocs: import("astro-docs/types").RouteData;
  }
}
declare module "virtual:astro-docs/config" {
  const config: import("astro-docs/schema").AstroDocsConfig & {
    collections: Record<
      string,
      { kind: "docs" | "book"; base: string; sidebar?: import("astro-docs/schema").SidebarConfig }
    >;
  };
  export default config;
}
declare module "virtual:astro-docs/user-css" {}
declare module "virtual:astro-docs/theme-css" {}
declare module "virtual:astro-docs/pagefind-config" {
  const options: Record<string, unknown>;
  export default options;
}
`,
				});
			},

			"astro:build:done": async ({ dir, logger }) => {
				const cfg = UserConfigSchema.parse(userConfig);
				if (cfg.pagefind !== false) {
					await runPagefind(dir, logger);
				}
			},
		},
	};
}

export type { AstroDocsConfig, AstroDocsUserConfig } from "../schema/config";
