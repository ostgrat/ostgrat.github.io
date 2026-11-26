import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

/** Themen-Kategorien (Filter auf der Startseite). */
export const categories = {
  warnung: 'Warnungen',
  soc: 'SOC',
  redteam: 'Red Team',
  ot: 'OT',
  compliance: 'Compliance',
} as const;

/** Beitragsarten = Unterordner von src/content/blog. */
export const types = {
  artikel: 'Artikel',
  warnungen: 'Sicherheitswarnung',
  fallstudien: 'Fallstudie',
} as const;
export type PostType = keyof typeof types;

export type Post = CollectionEntry<'blog'> & { type: PostType; cat: keyof typeof categories; alert: boolean };

/** Veröffentlichte Beiträge, neueste zuerst. Entwürfe bleiben unsichtbar. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => !p.data.draft);
  return posts
    .map((p) => {
      const type = p.id.split('/')[0] as PostType;
      const alert = type === 'warnungen';
      return { ...p, type, alert, cat: alert ? 'warnung' : (p.data.category ?? 'soc') } as Post;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postUrl = (p: Post) => `/blog/${p.id}/`;

export const formatDate = (d: Date) =>
  d.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** SVG-Titelbilder werden direkt eingebettet, damit sie die Schriften der Seite nutzen. */
export function inlineSvg(cover?: string) {
  if (!cover || !cover.endsWith('.svg')) return null;
  const file = path.join(process.cwd(), 'public', cover);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
}
