import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('Carlos Vargas'),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};
