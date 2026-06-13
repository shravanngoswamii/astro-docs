export type SidebarLink = {
  type: "link";
  label: string;
  href: string;
  badge?: string;
};

export type SidebarGroup = {
  type: "group";
  label: string;
  items: SidebarItem[];
  collapsed?: boolean;
};

export type SidebarItem = SidebarLink | SidebarGroup;

type DocEntry = {
  id: string;
  data: {
    title: string;
    sidebar?: {
      label?: string;
      order?: number;
      hidden?: boolean;
      badge?: string;
    };
  };
};

/** Flat sorted sidebar from a collection of docs entries. */
export function buildSidebar(
  entries: DocEntry[],
  basePath: string = "/docs",
): SidebarItem[] {
  return entries
    .filter((e) => !e.data.sidebar?.hidden)
    .sort((a, b) => {
      const oa = a.data.sidebar?.order ?? Infinity;
      const ob = b.data.sidebar?.order ?? Infinity;
      return oa !== ob ? oa - ob : a.id.localeCompare(b.id);
    })
    .map((e) => ({
      type: "link" as const,
      label: e.data.sidebar?.label ?? e.data.title,
      href: `${basePath}/${e.id}`,
      badge: e.data.sidebar?.badge,
    }));
}

/** Flatten all links out of a sidebar tree (for prev/next). */
export function flattenSidebar(items: SidebarItem[]): SidebarLink[] {
  return items.flatMap((item) =>
    item.type === "group" ? flattenSidebar(item.items) : [item],
  );
}

/** Resolve prev and next links for the current path. */
export function getPrevNext(
  items: SidebarItem[],
  currentPath: string,
): { prev?: SidebarLink; next?: SidebarLink } {
  const flat = flattenSidebar(items);
  const i = flat.findIndex((item) => item.href === currentPath);
  return {
    prev: i > 0 ? flat[i - 1] : undefined,
    next: i < flat.length - 1 ? flat[i + 1] : undefined,
  };
}
