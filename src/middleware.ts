// Englische Seiten (/en/…): fertiges HTML durch die Übersetzung der Oberflächentexte und die Link-Umschreibung schicken.
import { defineMiddleware } from 'astro:middleware';
import { langOf, localizeHtml } from './i18n/index.mjs';

export const onRequest = defineMiddleware(async (ctx, next) => {
  const res = await next();
  if (langOf(ctx.url.pathname) !== 'en' || !(res.headers.get('content-type') || '').includes('text/html')) return res;
  const html = await res.text();
  return new Response(localizeHtml(html), { status: res.status, headers: res.headers });
});
