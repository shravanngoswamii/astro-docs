import { defineCollection } from "astro:content";
import { bookLoader, docsLoader } from "astro-docs/loaders";
import { bookSchema, docsSchema } from "astro-docs/schema";

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema }),
	book: defineCollection({ loader: bookLoader(), schema: bookSchema }),
};
