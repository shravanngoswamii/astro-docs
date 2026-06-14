import type { SidebarConfig, SidebarItemInput } from "../schema/sidebar";
import type { Badge, LinkAttrs, NavLink, ResolvedSidebarItem } from "../types";

export interface SidebarEntry {
	id: string;
	data: {
		title: string;
		sidebar: {
			label?: string;
			order?: number;
			hidden?: boolean;
			badge?: string | { text: string; variant?: string; class?: string };
		};
		draft?: boolean;
	};
}

export interface BuildSidebarParams {
	config?: SidebarConfig;
	entries: SidebarEntry[];
	base: string;
	currentSlug: string;
}

function normalizeBase(base: string): string {
	return `/${base.replace(/^\/+|\/+$/g, "")}`;
}

/** Strip trailing "index" so folder index pages map to the folder URL. */
export function normalizeSlug(id: string): string {
	return id.replace(/(^|\/)index$/, "").replace(/^\/+|\/+$/g, "");
}

function hrefFor(base: string, slug: string): string {
	const b = normalizeBase(base);
	if (!slug) return b;
	// Avoid a leading "//" when base is root, which browsers treat as protocol-relative.
	return b === "/" ? `/${slug}` : `${b}/${slug}`;
}

function samePath(a: string, b: string): boolean {
	const strip = (s: string) => (s.length > 1 ? s.replace(/\/$/, "") : s);
	return strip(a) === strip(b);
}

function humanize(segment: string): string {
	return segment.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toBadge(
	input: SidebarEntry["data"]["sidebar"]["badge"],
): Badge | undefined {
	if (!input) return undefined;
	if (typeof input === "string") return { text: input, variant: "default" };
	return {
		text: input.text,
		variant: (input.variant as Badge["variant"]) ?? "default",
		class: input.class,
	};
}

function orderOf(e: SidebarEntry): number {
	return e.data.sidebar.order ?? Infinity;
}

function byOrderThenName(
	a: { order: number; label: string },
	b: { order: number; label: string },
): number {
	return a.order !== b.order
		? a.order - b.order
		: a.label.localeCompare(b.label);
}

interface DirNode {
	links: SidebarEntry[];
	dirs: Map<string, DirNode>;
	index?: SidebarEntry;
}

function emptyNode(): DirNode {
	return { links: [], dirs: new Map() };
}

function insert(root: DirNode, segments: string[], entry: SidebarEntry): void {
	if (segments.length === 0) {
		root.index = entry;
		return;
	}
	if (segments.length === 1) {
		if (segments[0] === "index") root.index = entry;
		else root.links.push(entry);
		return;
	}
	const [head, ...rest] = segments;
	let child = root.dirs.get(head);
	if (!child) {
		child = emptyNode();
		root.dirs.set(head, child);
	}
	insert(child, rest, entry);
}

function renderNode(
	node: DirNode,
	base: string,
	currentSlug: string,
	collapsed: boolean,
): { items: ResolvedSidebarItem[]; hasCurrent: boolean } {
	const linkItems = node.links.map((e) => {
		const slug = normalizeSlug(e.id);
		const isCurrent = slug === currentSlug;
		return {
			sortKey: {
				order: orderOf(e),
				label: e.data.sidebar.label ?? e.data.title,
			},
			resolved: {
				type: "link" as const,
				label: e.data.sidebar.label ?? e.data.title,
				href: hrefFor(base, slug),
				isCurrent,
				badge: toBadge(e.data.sidebar.badge),
			},
			isCurrent,
		};
	});

	const groupItems = [...node.dirs.entries()].map(([name, child]) => {
		const { items, hasCurrent: childHasCurrent } = renderNode(
			child,
			base,
			currentSlug,
			collapsed,
		);
		const label =
			child.index?.data.sidebar.label ??
			child.index?.data.title ??
			humanize(name);
		const order = child.index ? orderOf(child.index) : Infinity;
		const indexSlug = child.index ? normalizeSlug(child.index.id) : undefined;
		const href = indexSlug !== undefined ? hrefFor(base, indexSlug) : undefined;
		const hasCurrent =
			childHasCurrent || (indexSlug !== undefined && indexSlug === currentSlug);
		return {
			sortKey: { order, label },
			resolved: {
				type: "group" as const,
				label,
				collapsed: collapsed && !hasCurrent,
				items,
				hasCurrent,
				href,
			},
			hasCurrent,
		};
	});

	const merged = [...linkItems, ...groupItems].sort((a, b) =>
		byOrderThenName(a.sortKey, b.sortKey),
	);

	return {
		items: merged.map((m) => m.resolved),
		hasCurrent: merged.some((m) =>
			"isCurrent" in m ? m.isCurrent : m.hasCurrent,
		),
	};
}

function visibleEntries(entries: SidebarEntry[]): SidebarEntry[] {
	return entries.filter((e) => !e.data.draft && !e.data.sidebar.hidden);
}

function autogenerate(
	entries: SidebarEntry[],
	directory: string,
	base: string,
	currentSlug: string,
	collapsed: boolean,
): ResolvedSidebarItem[] {
	const dir = directory.replace(/^\/+|\/+$/g, "");
	const root = emptyNode();
	for (const e of visibleEntries(entries)) {
		const inDir = dir === "" || e.id === dir || e.id.startsWith(`${dir}/`);
		if (!inDir) continue;
		const relative = dir === "" ? e.id : e.id.slice(dir.length + 1);
		insert(root, relative.split("/").filter(Boolean), e);
	}
	const { items } = renderNode(root, base, currentSlug, collapsed);
	// A directory's own index page becomes a leading link (subdirectory indexes
	// are used as group labels instead, inside renderNode).
	if (root.index) {
		const slug = normalizeSlug(root.index.id);
		items.unshift({
			type: "link",
			label: root.index.data.sidebar.label ?? root.index.data.title,
			href: hrefFor(base, slug),
			isCurrent: slug === currentSlug,
			badge: toBadge(root.index.data.sidebar.badge),
		});
	}
	return items;
}

function resolveItem(
	item: SidebarItemInput,
	entries: SidebarEntry[],
	base: string,
	currentSlug: string,
): ResolvedSidebarItem | ResolvedSidebarItem[] | null {
	if (typeof item === "string") {
		return resolveInternal({ slug: item }, entries, base, currentSlug);
	}
	if ("autogenerate" in item) {
		const generated = autogenerate(
			entries,
			item.autogenerate.directory,
			base,
			currentSlug,
			item.autogenerate.collapsed ?? false,
		);
		if (item.label) {
			const hasCurrent = generated.some((i) =>
				i.type === "link" ? i.isCurrent : i.hasCurrent,
			);
			return {
				type: "group",
				label: item.label,
				collapsed: (item.collapsed ?? false) && !hasCurrent,
				badge: normalizeConfigBadge(item.badge),
				items: generated,
				hasCurrent,
			};
		}
		return generated;
	}
	if ("items" in item) {
		const items = item.items
			.flatMap((i) => resolveItem(i, entries, base, currentSlug))
			.filter((i): i is ResolvedSidebarItem => i !== null);
		const hasCurrent = items.some((i) =>
			i.type === "link" ? i.isCurrent : i.hasCurrent,
		);
		return {
			type: "group",
			label: item.label,
			collapsed: (item.collapsed ?? false) && !hasCurrent,
			badge: normalizeConfigBadge(item.badge),
			items,
			hasCurrent,
		};
	}
	if ("slug" in item) {
		return resolveInternal(item, entries, base, currentSlug);
	}
	// manual external/internal link with explicit link
	const href = item.link;
	return {
		type: "link",
		label: item.label,
		href,
		isCurrent: samePath(href, hrefFor(base, currentSlug)),
		badge: normalizeConfigBadge(item.badge),
		attrs: item.attrs as LinkAttrs | undefined,
	};
}

function resolveInternal(
	item: { slug: string; label?: string; badge?: unknown; attrs?: unknown },
	entries: SidebarEntry[],
	base: string,
	currentSlug: string,
): ResolvedSidebarItem | null {
	const slug = normalizeSlug(item.slug);
	const entry = entries.find((e) => normalizeSlug(e.id) === slug);
	if (!entry) return null;
	return {
		type: "link",
		label: item.label ?? entry.data.sidebar.label ?? entry.data.title,
		href: hrefFor(base, slug),
		isCurrent: slug === currentSlug,
		badge: normalizeConfigBadge(item.badge),
		attrs: item.attrs as LinkAttrs | undefined,
	};
}

function normalizeConfigBadge(badge: unknown): Badge | undefined {
	if (!badge) return undefined;
	if (typeof badge === "string") return { text: badge, variant: "default" };
	const b = badge as {
		text: string;
		variant?: Badge["variant"];
		class?: string;
	};
	return { text: b.text, variant: b.variant ?? "default", class: b.class };
}

export function buildSidebar(
	params: BuildSidebarParams,
): ResolvedSidebarItem[] {
	const { config, entries, base, currentSlug } = params;
	if (!config) {
		return autogenerate(entries, "", base, currentSlug, false);
	}
	return config
		.flatMap((item) => resolveItem(item, entries, base, currentSlug))
		.filter((i): i is ResolvedSidebarItem => i !== null);
}

export function flattenSidebar(items: ResolvedSidebarItem[]): NavLink[] {
	return items.flatMap((item) =>
		item.type === "group"
			? flattenSidebar(item.items)
			: [{ label: item.label, href: item.href }],
	);
}

export function getPrevNext(
	items: ResolvedSidebarItem[],
	currentUrl: string,
): { prev?: NavLink; next?: NavLink } {
	const flat = flattenSidebar(items);
	const i = flat.findIndex((l) => l.href === currentUrl);
	if (i === -1) return {};
	return {
		prev: i > 0 ? flat[i - 1] : undefined,
		next: i < flat.length - 1 ? flat[i + 1] : undefined,
	};
}
