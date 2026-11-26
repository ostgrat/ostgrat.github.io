import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';

export const categories = {
  warnung: 'Warnungen',
  soc: 'SOC',
  redteam: 'Red Team',
  ot: 'OT',
  compliance: 'Compliance',
} as const;

/** Veröffentlichte Beiträge, neueste zuerst. Entwürfe bleiben unsichtbar. */
export async function getPosts() {
  const posts = await getCollection('blog', (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('de-AT', { day: 'numeric', month: 'long', year: 'numeric' });

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** SVG-Titelbilder werden direkt eingebettet, damit sie die Schriften der Seite nutzen. */
export function inlineSvg(cover?: string) {
  if (!cover || !cover.endsWith('.svg')) return null;
  const file = path.join(process.cwd(), 'public', cover);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : null;
}
