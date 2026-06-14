declare module "virtual:astro-docs/config" {
	import type { AstroDocsConfig } from "./schema/config";
	import type { SidebarConfig } from "./schema/sidebar";
	export interface ResolvedCollections {
		[name: string]: {
			kind: "docs" | "book";
			base: string;
			sidebar?: SidebarConfig;
		};
	}
	const config: AstroDocsConfig & { collections: ResolvedCollections };
	export default config;
}

declare module "virtual:astro-docs/user-css" {}

declare module "virtual:astro-docs/theme-css" {}

declare module "virtual:astro-docs/components/*" {
	const Component: (props: Record<string, unknown>) => unknown;
	export default Component;
}

declare module "virtual:astro-docs/pagefind-config" {
	const options: Record<string, unknown>;
	export default options;
}

declare namespace App {
	interface Locals {
		astroDocs: import("./types").RouteData;
	}
}
