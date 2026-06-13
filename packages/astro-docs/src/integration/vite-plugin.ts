import { resolve } from "node:path";
import type { AstroDocsConfig } from "../schema/config";
import type { OverridableComponentName } from "../types";

type VitePlugin = {
  name: string;
  enforce?: "pre" | "post";
  resolveId(id: string): string | undefined;
  load(id: string): string | undefined;
};

const RESOLVED_PREFIX = "\0";
const COMPONENT_NS = "virtual:astro-docs/components/";

interface PluginOptions {
  config: AstroDocsConfig;
  collections: Record<string, { kind: "docs" | "book"; base: string }>;
  root: string;
  /** Absolute path to the package's `src` dir, for resolving default components. */
  srcDir: string;
  componentNames: readonly OverridableComponentName[];
  pagefindOptions: Record<string, unknown>;
}

/** Resolve a customCss entry to an importable module specifier. */
function resolveCssImport(id: string, root: string): string {
  if (id.startsWith(".") || id.startsWith("/")) {
    return JSON.stringify(resolve(root, id.replace(/^\//, "")));
  }
  return JSON.stringify(id);
}

function defaultComponentPath(srcDir: string, name: string): string {
  return resolve(srcDir, "components", `${name}.astro`);
}

const BUILTIN_PRESETS = new Set(["paper"]);

/** JS module that imports the selected theme preset CSS (empty for "none"). */
function resolveThemeCss(theme: string, srcDir: string, root: string): string {
  if (theme === "none") return "";
  if (BUILTIN_PRESETS.has(theme)) {
    return `import ${JSON.stringify(resolve(srcDir, "styles", "presets", `${theme}.css`))};`;
  }
  // A relative/absolute path resolves against the project root; anything else is
  // treated as a bare module specifier (mirrors customCss resolution).
  if (theme.startsWith(".") || theme.startsWith("/")) {
    return `import ${JSON.stringify(resolve(root, theme.replace(/^\//, "")))};`;
  }
  return `import ${JSON.stringify(theme)};`;
}

export function astroDocsVitePlugin(opts: PluginOptions): VitePlugin {
  const { config, collections, root, srcDir, componentNames, pagefindOptions } =
    opts;

  const userCss = config.customCss
    .map((id) => `import ${resolveCssImport(id, root)};`)
    .join("\n");

  const themeCss = resolveThemeCss(config.theme, srcDir, root);

  const staticModules: Record<string, string> = {
    "virtual:astro-docs/config": `export default ${JSON.stringify({
      ...config,
      collections,
    })};`,
    "virtual:astro-docs/user-css": userCss,
    "virtual:astro-docs/theme-css": themeCss,
    "virtual:astro-docs/pagefind-config": `export default ${JSON.stringify(
      pagefindOptions,
    )};`,
  };

  const overridable = new Set<string>(componentNames);

  return {
    name: "vite-plugin-astro-docs",
    resolveId(id) {
      if (id in staticModules) return RESOLVED_PREFIX + id;
      if (id.startsWith(COMPONENT_NS)) return RESOLVED_PREFIX + id;
      return undefined;
    },
    load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) return undefined;
      const key = id.slice(RESOLVED_PREFIX.length);
      if (key in staticModules) return staticModules[key];
      if (key.startsWith(COMPONENT_NS)) {
        const name = key.slice(COMPONENT_NS.length);
        if (!overridable.has(name)) return undefined;
        const override = config.components[name];
        const target = override
          ? JSON.stringify(resolve(root, override.replace(/^\//, "")))
          : JSON.stringify(defaultComponentPath(srcDir, name));
        return `export { default } from ${target};`;
      }
      return undefined;
    },
  };
}
