// Mehrsprachigkeit: Deutsch ist Standard (ohne Präfix), Englisch liegt unter /en/.
// Inhalte (Startseite, Seiten, Blog) haben je Sprache eigene Dateien (…/name.en.md, home.en.json).
// Feste Oberflächentexte aus Navbar, Footer, Vorlagen und Skripten übersetzt src/i18n/en.json beim Rendern (src/middleware.ts).
import en from './en.json' with { type: 'json' };

export const LANGS = ['de', 'en'];
export const langOf = (path) => (path === '/en' || path.startsWith('/en/') ? 'en' : 'de');
/** Gleiche Seite in der anderen Sprache. */
export const altPath = (path) => (langOf(path) === 'en' ? path.slice(3) || '/' : '/en' + path);
export const prefix = (lang) => (lang === 'en' ? '/en' : '');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const L = 'A-Za-zÄÖÜäöüß0-9';
// Längste Einträge zuerst, damit „Alle Leistungen“ vor „Leistungen“ greift.
const ENT = (s) => s.replace(/&/g, '&amp;');
const PAIRS = Object.entries(en).filter(([k, v]) => k && v && k !== v && !k.startsWith('//'))
  .flatMap(([k, v]) => (k.includes('&') ? [[k, v], [ENT(k), ENT(v)]] : [[k, v]]))
  .sort((a, b) => b[0].length - a[0].length);
const RX = PAIRS.length ? new RegExp(`(?<![${L}])(${PAIRS.map(([k]) => esc(k)).join('|')})(?![${L}])`, 'g') : null;
const MAP = new Map(PAIRS);
/** Einzelnen Text übersetzen (für Vorlagen). */
export const t = (lang, s) => (lang === 'en' ? MAP.get(s) ?? s : s);

// Interne Links auf /en/ umschreiben; Dateien, Admin und schon englische Pfade bleiben.
const KEEP = /^\/(en\/|en$|uploads|styles|schriften|fonts|img|scripts|admin|favicon|apple-touch|vorschau|bloecke)/;
// routes: deutsche Seitenadresse → englische (Seiten und Beiträge mit eigener englischer Adresse)
const fixHref = (p, routes) => {
  if (KEEP.test(p) || /\.[a-z0-9]{2,5}(?:[?#]|$)/i.test(p)) return p;
  const m = p.match(/^([^?#]*)(.*)$/), base = m[1], rest = m[2];
  return routes?.get(base) ? routes.get(base) + rest : '/en' + p;
};

/** Fertiges HTML einer englischen Seite: Sprache, Oberflächentexte, interne Links. */
export function localizeHtml(html, routes) {
  let out = html.replace(/<html lang="de"/, '<html lang="en"');
  if (RX) out = out.replace(RX, (m) => MAP.get(m) ?? m);
  // Links zur deutschen Fassung (hreflang="de") bleiben unverändert
  out = out.replace(/<(?:a|form|span)\b[^>]*>/g, (tag) => (/\bhreflang="de"/.test(tag) ? tag : tag.replace(/\b(href|action|data-href)="(\/[^"]*)"/g, (m, a, p) => `${a}="${fixHref(p, routes)}"`)));
  return out;
}
