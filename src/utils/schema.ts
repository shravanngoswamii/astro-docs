import { z } from "astro:content";

export const docsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  sidebar: z
    .object({
      label: z.string().optional(),
      order: z.number().optional(),
      hidden: z.boolean().optional(),
      badge: z.string().optional(),
    })
    .optional(),
  draft: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  tableOfContents: z.boolean().default(true),
});

export type DocsEntry = z.infer<typeof docsSchema>;
