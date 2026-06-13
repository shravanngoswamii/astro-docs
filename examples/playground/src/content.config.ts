import { defineCollection } from "astro:content";
import { docsLoader, bookLoader } from "astro-docs/loaders";
import { docsSchema, bookSchema } from "astro-docs/schema";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema }),
  book: defineCollection({ loader: bookLoader(), schema: bookSchema }),
};
