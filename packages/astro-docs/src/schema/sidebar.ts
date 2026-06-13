import { z } from "astro/zod";

const badgeSchema = z.union([
  z.string(),
  z.object({
    text: z.string(),
    variant: z
      .enum(["default", "note", "tip", "caution", "danger", "success"])
      .default("default"),
    class: z.string().optional(),
  }),
]);

const linkAttrsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()]),
);

const baseLink = z.object({
  label: z.string(),
  link: z.string(),
  badge: badgeSchema.optional(),
  attrs: linkAttrsSchema.optional(),
});

const internalLink = z.object({
  slug: z.string(),
  label: z.string().optional(),
  badge: badgeSchema.optional(),
  attrs: linkAttrsSchema.optional(),
});

const autogenerate = z.object({
  label: z.string().optional(),
  collapsed: z.boolean().optional(),
  badge: badgeSchema.optional(),
  autogenerate: z.object({
    directory: z.string(),
    collapsed: z.boolean().optional(),
    attrs: linkAttrsSchema.optional(),
  }),
});

type ManualGroupInput = {
  label: string;
  collapsed?: boolean;
  badge?: z.input<typeof badgeSchema>;
  items: SidebarItemInput[];
};

export type SidebarItemInput =
  | string
  | z.input<typeof baseLink>
  | z.input<typeof internalLink>
  | z.input<typeof autogenerate>
  | ManualGroupInput;

const sidebarItemSchema: z.ZodType<SidebarItemInput> = z.lazy(() =>
  z.union([
    z.string(),
    baseLink,
    internalLink,
    autogenerate,
    z.object({
      label: z.string(),
      collapsed: z.boolean().optional(),
      badge: badgeSchema.optional(),
      items: z.array(sidebarItemSchema),
    }),
  ]),
);

export const sidebarSchema = z.array(sidebarItemSchema);

export type SidebarConfig = z.infer<typeof sidebarSchema>;
export { badgeSchema };
