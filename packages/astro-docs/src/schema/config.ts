import { z } from "astro/zod";
import { sidebarSchema } from "./sidebar";

const logoSchema = z.union([
  z.object({
    src: z.string(),
    alt: z.string().default(""),
    replacesTitle: z.boolean().default(false),
  }),
  z.object({
    dark: z.string(),
    light: z.string(),
    alt: z.string().default(""),
    replacesTitle: z.boolean().default(false),
  }),
]);

const socialSchema = z.array(
  z.object({
    icon: z.string(),
    label: z.string(),
    href: z.string().url(),
  }),
);

const headTagSchema = z.object({
  tag: z.string(),
  attrs: z
    .record(z.string(), z.union([z.string(), z.boolean(), z.undefined()]))
    .default({}),
  content: z.string().default(""),
});

const localeSchema = z.object({
  label: z.string(),
  lang: z.string().optional(),
  dir: z.enum(["ltr", "rtl"]).default("ltr"),
});

export const UserConfigSchema = z.object({
  title: z.union([z.string(), z.record(z.string(), z.string())]),
  description: z.string().optional(),
  tagline: z.string().optional(),

  logo: logoSchema.optional(),
  favicon: z.string().default("/favicon.svg"),
  social: socialSchema.default([]),

  sidebar: sidebarSchema.optional(),
  tableOfContents: z
    .union([
      z.boolean(),
      z.object({
        minHeadingLevel: z.number().int().min(1).max(6).default(2),
        maxHeadingLevel: z.number().int().min(1).max(6).default(3),
      }),
    ])
    .default({ minHeadingLevel: 2, maxHeadingLevel: 3 }),

  pagination: z.boolean().default(true),
  lastUpdated: z.boolean().default(false),
  editLink: z.object({ baseUrl: z.string().url() }).optional(),

  customCss: z.array(z.string()).default([]),
  theme: z.string().default("paper"),
  colorScheme: z.enum(["light", "dark", "both"]).default("light"),

  head: z.array(headTagSchema).default([]),

  expressiveCode: z.union([z.boolean(), z.record(z.string(), z.any())]).default(true),
  pagefind: z.union([z.boolean(), z.record(z.string(), z.any())]).default(true),
  sitemap: z.boolean().default(true),

  math: z.boolean().default(false),

  components: z.record(z.string(), z.string()).default({}),
  routeMiddleware: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (typeof v === "string" ? [v] : v))
    .default([]),

  locales: z.record(z.string(), localeSchema).optional(),
  defaultLocale: z.string().optional(),

  disable404Route: z.boolean().default(false),
});

export type AstroDocsUserConfig = z.input<typeof UserConfigSchema>;
export type AstroDocsConfig = z.output<typeof UserConfigSchema>;
