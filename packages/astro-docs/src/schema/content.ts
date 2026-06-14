import { z } from "astro/zod";
import { badgeSchema } from "./sidebar";

const tocSchema = z.union([
	z.boolean(),
	z.object({
		minHeadingLevel: z.number().int().min(1).max(6).default(2),
		maxHeadingLevel: z.number().int().min(1).max(6).default(3),
	}),
]);

/** Frontmatter shared by docs and book entries. */
export const contentSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	sidebar: z
		.object({
			label: z.string().optional(),
			order: z.number().optional(),
			hidden: z.boolean().default(false),
			badge: badgeSchema.optional(),
		})
		.default({ hidden: false }),
	tableOfContents: tocSchema.optional(),
	draft: z.boolean().default(false),
	tags: z.array(z.string()).optional(),
	editUrl: z.union([z.string(), z.boolean()]).optional(),
	lastUpdated: z.union([z.boolean(), z.coerce.date()]).optional(),
	pagefind: z.boolean().default(true),
	banner: z.object({ content: z.string() }).optional(),
});

/** Book entries add part/chapter grouping for hierarchical numbering. */
export const bookSchema = contentSchema.extend({
	part: z.string().optional(),
	chapter: z.number().optional(),
	numberSections: z.boolean().optional(),
});

export const docsSchema = contentSchema;

export type DocsFrontmatter = z.infer<typeof docsSchema>;
export type BookFrontmatter = z.infer<typeof bookSchema>;
