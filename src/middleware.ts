// Englische Seiten (/en/…): fertiges HTML durch die Übersetzung der Oberflächentexte und die Link-Umschreibung schicken.
import { defineMiddleware } from 'astro:middleware';
import { getCollection } from 'astro:content';
import { langOf, localizeHtml } from './i18n/index.mjs';
import { getPosts, postUrl } from './lib/blog';

// Deutsche Adresse → englische Adresse, für Seiten und Beiträge mit eigener englischer Adresse (urlSlug)
let routes: Map<string, string> | null = null;
async function routeMap() {
  if (routes) return routes;
  const m = new Map<string, string>();
  for (const p of await getCollection('pages', (p) => p.id.endsWith('.en'))) {
    const id = p.id.slice(0, -3);
    m.set(`/${id}/`, `/en/${p.data.urlSlug || id}/`);
  }
  const [de, en] = await Promise.all([getPosts('de'), getPosts('en')]);
  const enBy = new Map(en.map((p) => [p.slug, p]));
  for (const p of de) { const e = enBy.get(p.slug); if (e) m.set(postUrl(p), postUrl(e)); }
  return (routes = m);
}

export const onRequest = defineMiddleware(async (ctx, next) => {
  const res = await next();
  if (langOf(ctx.url.pathname) !== 'en' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const html = await res.text();
  return new Response(localizeHtml(html, await routeMap()), { status: res.status, headers: res.headers });
});
