import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AstroIntegrationLogger } from "astro";

const run = promisify(execFile);

/**
 * Resolve the Pagefind CLI binary shipped with the `pagefind` package. Resolves
 * the package's main entry (allowed by its exports map) and walks up to the
 * package root to read its `bin` field — `require.resolve("pagefind/package.json")`
 * is blocked by the exports gate and would always throw.
 */
function resolvePagefindBin(): string | undefined {
  try {
    const require = createRequire(import.meta.url);
    const entry = require.resolve("pagefind");
    let dir = dirname(entry);
    for (let i = 0; i < 8; i++) {
      try {
        const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
        if (pkg.name === "pagefind" && pkg.bin) {
          const rel = typeof pkg.bin === "string" ? pkg.bin : pkg.bin.pagefind;
          if (rel) return join(dir, rel);
        }
      } catch {
        // keep walking up
      }
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch {
    // fall through to npx
  }
  return undefined;
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
