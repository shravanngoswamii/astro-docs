import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AstroIntegrationLogger } from "astro";

const run = promisify(execFile);

/** Resolve the Pagefind CLI binary shipped with the `pagefind` package. */
function resolvePagefindBin(): string | undefined {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require.resolve("pagefind/package.json");
    const bin = require("pagefind/package.json").bin as
      | string
      | Record<string, string>;
    const rel = typeof bin === "string" ? bin : bin.pagefind;
    return fileURLToPath(new URL(rel, `file://${pkg}`));
  } catch {
    return undefined;
  }
}

/**
 * Runs Pagefind against the built site to produce a static search index.
 * Spawns the CLI binary directly so it works outside Vite's module runner.
 */
export async function runPagefind(
  outDir: URL,
  logger: AstroIntegrationLogger,
): Promise<void> {
  const sitePath = fileURLToPath(outDir);
  const bin = resolvePagefindBin();
  try {
    if (bin) {
      await run(process.execPath, [bin, "--site", sitePath]);
    } else {
      await run("npx", ["--no-install", "pagefind", "--site", sitePath]);
    }
    logger.info("Search index built with Pagefind.");
  } catch (err) {
    logger.warn(
      `Could not build the Pagefind search index. Install "pagefind" to enable search. ${
        err instanceof Error ? err.message : ""
      }`,
    );
  }
}
