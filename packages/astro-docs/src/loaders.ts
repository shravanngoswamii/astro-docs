import { glob } from "astro/loaders";

interface LoaderOptions {
	/** Directory the content lives in, relative to project root. */
	base?: string;
	/** Glob pattern. Defaults to all md/mdx, ignoring files prefixed with "_". */
	pattern?: string;
}

export function docsLoader(opts: LoaderOptions = {}) {
	return glob({
		pattern: opts.pattern ?? "**/[^_]*.{md,mdx}",
		base: opts.base ?? "./src/content/docs",
	});
}

export function bookLoader(opts: LoaderOptions = {}) {
	return glob({
		pattern: opts.pattern ?? "**/[^_]*.{md,mdx}",
		base: opts.base ?? "./src/content/book",
	});
}
