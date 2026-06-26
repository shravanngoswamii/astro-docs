/**
 * Prefixes a root-absolute href with the site's base path so the framework
 * works when deployed under a subpath (e.g. GitHub Pages project sites).
 * `base` is Astro's `import.meta.env.BASE_URL` (always ends with "/", "/" at root).
 */
export function joinBase(base: string, href: string): string {
	const b = base.replace(/\/+$/, "");
	if (!b) return href;
	if (href === "/") return b;
	return `${b}${href.startsWith("/") ? href : `/${href}`}`;
}
