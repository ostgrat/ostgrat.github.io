import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog: ein Unterordner pro Beitragsart (artikel, warnungen, fallstudien).
const blog = defineCollection({
  loader: glob({ pattern: '{artikel,warnungen,fallstudien}/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    author: z.string(),
    draft: z.boolean().default(false),
    excerpt: z.string(),
    cover: z.string().optional(),
    // Artikel und Fallstudie
    category: z.enum(['soc', 'redteam', 'ot', 'compliance']).optional(),
    // Sicherheitswarnung
    cve: z.string().optional(),
    severity: z.enum(['kritisch', 'hoch', 'mittel']).optional(),
    affected: z.array(z.string()).optional(),
    actions: z.array(z.string()).optional(),
    // Fallstudie
    industry: z.string().optional(),
    companySize: z.string().optional(),
    duration: z.string().optional(),
    results: z.array(z.object({ value: z.coerce.string(), label: z.string() })).optional(),
    challenge: z.string().optional(),
    approach: z.string().optional(),
    outcome: z.string().optional(),
  }),
});

// Seitenbaukasten: jede Datei ist eine Seite aus Blöcken.
const block = z.object({ type: z.string() }).passthrough();
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    draft: z.boolean().default(false),
    blocks: z.array(block).default([]),
  }),
});

export const collections = { blog, pages };
