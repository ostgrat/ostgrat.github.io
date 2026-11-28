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

export type Lang = 'de' | 'en';
export type Post = CollectionEntry<'blog'> & { type: PostType; cat: keyof typeof categories; alert: boolean; lang: Lang; slug: string; path: string };

/** Ordner der Beitragsarten in englischen Adressen. */
export const typePathEn: Record<PostType, string> = { artikel: 'articles', warnungen: 'alerts', fallstudien: 'case-studies' };
/** Adresse ohne /blog/: Deutsch = Datei-Id, Englisch = englischer Ordner + urlSlug (oder Dateiname). */
const pathOf = (p: { lang: Lang; slug: string; type: PostType; data: { urlSlug?: string } }) =>
  p.lang === 'en' ? `${typePathEn[p.type]}/${(p.data.urlSlug || p.slug.split('/')[1]).trim()}` : p.slug;

/** Sprache aus der Id: „artikel/name.en“ ist Englisch, sonst Deutsch. */
export const splitId = (id: string) => (id.endsWith('.en') ? { lang: 'en' as Lang, slug: id.slice(0, -3) } : { lang: 'de' as Lang, slug: id });

/** Veröffentlichte Beiträge, neueste zuerst. Entwürfe bleiben unsichtbar. */
export async function getPosts(lang: Lang = 'de'): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => !p.data.draft && splitId(p.id).lang === lang);
  return posts
    .map((p) => {
      const type = p.id.split('/')[0] as PostType;
      const alert = type === 'warnungen';
      const q = { ...p, ...splitId(p.id), type, alert, cat: alert ? 'warnung' : (p.data.category ?? 'soc') };
      return { ...q, path: pathOf(q) } as Post;
    })
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const postUrl = (p: Post) => `${p.lang === 'en' ? '/en' : ''}/blog/${p.path}/`;

export const formatDate = (d: Date, lang: Lang = 'de') =>
  d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-AT', { day: 'numeric', month: 'long', year: 'numeric' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** SVG-Titelbilder werden direkt eingebettet, damit sie die Schriften der Seite nutzen. */
export function inlineSvg(cover?: string) {
  if (!cover || !cover.endsWith('.svg')) return null;
  const file = path.join(process.cwd(), 'public', cover);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
}

/** Beitrag als einfache Daten für den gemeinsamen Renderer (src/lib/blocks.mjs). */
export const toCard = (p: Post) => ({
  url: postUrl(p),
  title: p.data.title,
  excerpt: p.data.excerpt,
  author: p.data.author,
  dateText: formatDate(p.data.date, p.lang),
  iso: isoDate(p.data.date),
  cover: p.data.cover,
  coverSvg: inlineSvg(p.data.cover),
  alert: p.alert,
  cat: p.cat,
  typeLabel: types[p.type],
});
