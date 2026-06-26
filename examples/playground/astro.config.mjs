// @ts-check
import { defineConfig } from "astro/config";
import astroDocs from "astro-docs";

export default defineConfig({
	site: process.env.SITE ?? "https://example.com",
	base: process.env.BASE_PATH ?? "/",
	integrations: [
		astroDocs({
			title: "Astro Docs Playground",
			description: "A demo of the astro-docs framework: docs and a book.",
			colorScheme: "both",
			math: true,
			lastUpdated: true,
			social: [
				{
					icon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56v-2c-3.34.71-4.04-1.6-4.04-1.6-.55-1.36-1.34-1.72-1.34-1.72-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.22 1.84 1.22 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.84 0-1.29.47-2.35 1.23-3.18-.12-.3-.53-1.51.12-3.15 0 0 1-.32 3.3 1.21a11.5 11.5 0 0 1 6 0C17.3 4.96 18.3 5.28 18.3 5.28c.65 1.64.24 2.85.12 3.15.77.83 1.23 1.89 1.23 3.18 0 4.54-2.81 5.54-5.49 5.83.43.37.81 1.1.81 2.22v3.29c0 .31.21.68.82.56A12.01 12.01 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z"/></svg>',
					label: "GitHub",
					href: "https://github.com/shravanngoswamii",
				},
			],
			editLink: {
				baseUrl:
					"https://github.com/shravanngoswamii/astro-docs/edit/main/examples/playground",
			},
			customCss: ["./src/styles/custom.css"],
			collections: {
				docs: {
					kind: "docs",
					base: "/docs",
					sidebar: [
						{ slug: "index", label: "Introduction" },
						{ label: "Guides", autogenerate: { directory: "guides" } },
						{ label: "Reference", autogenerate: { directory: "reference" } },
					],
				},
				book: {
					kind: "book",
					base: "/book",
					sidebar: [{ autogenerate: { directory: "" } }],
				},
			},
		}),
	],
});
