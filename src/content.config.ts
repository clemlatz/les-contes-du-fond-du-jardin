import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const episode = defineCollection({
  loader: glob({ base: './src/content/episodes', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      coverImage: image().optional(),
      audioUrl: z.string().optional(),
      durationInSeconds: z.number(),
      sizeInBytes: z.number(),
      episodeCover: z.string().optional(),
    }),
});

export const collections = { episode };
