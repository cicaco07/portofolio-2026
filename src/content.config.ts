import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
	schema: z.object({
		title: z.string(),
		slug: z.string(),
		year: z.string(),
		role: z.string(),
		client: z.string().optional(),
		description: z.string(),
		techStack: z.array(z.string()),
		liveUrl: z.string().optional(),
		githubUrl: z.string().optional(),
		repoVisibility: z.enum(['public', 'private']).optional(),
		accent: z.enum(['primary', 'secondary', 'accent']),
		duration: z.string().optional(),
		teamSize: z.string().optional(),
		status: z.enum(['live', 'in-development', 'archived']).optional(),
		coverImage: z.string().optional(),
		screenshots: z.array(z.object({
			src: z.string(),
			alt: z.string(),
		})).optional(),
	}),
});

export const collections = { projects };
