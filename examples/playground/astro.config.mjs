// @ts-check
import { defineConfig } from "astro/config";
import astroDocs from "astro-docs";

export default defineConfig({
  site: "https://example.com",
  integrations: [
    astroDocs({
      title: "Astro Docs Playground",
      description: "A demo of the astro-docs framework: docs and a book.",
      colorScheme: "both",
      math: true,
      lastUpdated: true,
      social: [
        { icon: "GitHub", label: "GitHub", href: "https://github.com/shravanngoswamii" },
      ],
      editLink: {
        baseUrl: "https://github.com/shravanngoswamii/astro-docs/edit/main/examples/playground",
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
