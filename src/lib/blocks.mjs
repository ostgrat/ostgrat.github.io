// Gemeinsamer Block-Renderer: erzeugt das HTML der Baukasten-Blöcke.
// Wird von der Website (Astro) UND von der Live-Vorschau im CMS benutzt,
// damit beide garantiert gleich aussehen. Styles: public/styles/site.css
// Kein Framework, keine Abhängigkeiten – Markdown kommt über ctx.md herein.

export const icons = {
  arrow: "<svg viewBox=\"0 0 256 256\" aria-hidden=\"true\"><path d=\"M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z\"/></svg>",
  chevron: "<svg viewBox=\"0 0 256 256\" aria-hidden=\"true\"><path d=\"M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z\"/></svg>",
  alert: "<span class=\"bl-alert\"><i></i>Sicherheitswarnung</span>",
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const attr = esc;

export const cta = (href, label) =>
  href && label ? `<a class="cta" href="${attr(href)}"><b><span>${esc(label)}</span></b><i>${icons.arrow}</i></a>` : '';

const head = (b) =>
  (b.heading ? `<h2 class="h2">${esc(b.heading)}</h2>` : '') + (b.kicker ? `<p class="lab sub">${esc(b.kicker)}</p>` : '');   /* keine Eyebrows: Kicker steht als Subline unter der Headline */

/** Beitragskarte (Startseiten-Teaser, Blog-Übersicht, Blog-Teaser-Block). */
export function card(p, { showType = false } = {}) {
  const media = p.coverSvg ? p.coverSvg : p.cover ? `<img src="${attr(p.cover)}" alt="" loading="lazy">` : '';
  return `<article class="card${p.alert ? ' is-alert' : ''}">` +
    `<a class="hit" href="${attr(p.url)}" aria-label="${attr(p.title)}"></a>` +
    `<figure>${media}${p.alert ? icons.alert : ''}</figure>` +
    (showType && !p.alert ? `<p class="type">${esc(p.typeLabel)}</p>` : '') +
    `<h3 class="h3">${esc(p.title)}</h3><p class="ex">${esc(p.excerpt)}</p>` +
    `<p class="meta"><span>${esc(p.author)}</span><span>${esc(p.dateText)}</span></p></article>`;
}

const renderers = {
  hero: (b, ctx) =>
    `<section class="blk b-hero${b.image ? ' has-img' : ''}"><div class="copy">` +
    `<h1 class="h1">${esc(b.headline)}${b.highlight ? `<span class="hl">${esc(b.highlight)}</span>` : ''}</h1>` +
    (b.kicker ? `<p class="lab sub">${esc(b.kicker)}</p>` : '') +
    (b.lead ? `<p class="lead">${esc(b.lead)}</p>` : '') +
    cta(b.ctaLink, b.ctaLabel) +
    `</div>${b.image ? `<figure><img src="${attr(ctx.asset(b.image))}" alt=""></figure>` : ''}</section>`,

  text: (b, ctx) =>
    `<section class="blk b-text"><div>${head(b)}</div><div class="prose">${ctx.md(b.body)}</div></section>`,

  imageText: (b, ctx) =>
    `<section class="blk b-it${b.imagePosition === 'rechts' ? ' right' : ''}">` +
    `<figure>${b.image ? `<img src="${attr(ctx.asset(b.image))}" alt="" loading="lazy">` : ''}</figure>` +
    `<div class="txt">${head(b)}<div class="prose">${ctx.md(b.body)}</div>${cta(b.ctaLink, b.ctaLabel)}</div></section>`,

  stats: (b) =>
    `<section class="blk b-stats">${head(b)}<dl>` +
    (b.items || []).map((it) => `<div><dt>${esc(it.value)}</dt><dd>${esc(it.label)}</dd></div>`).join('') +
    `</dl></section>`,

  faq: (b) =>
    `<section class="blk b-faq"><div>${head(b)}</div><div class="list">` +
    (b.items || []).map((it, i) =>
      `<details name="faq"${i === 0 ? ' open' : ''}><summary><h3 class="h3">${esc(it.question)}</h3><i>${icons.chevron}</i></summary><p>${esc(it.answer)}</p></details>`
    ).join('') +
    `</div></section>`,

  cta: (b) =>
    `<section class="blk b-cta"><div class="box"><h2 class="h2">${esc(b.heading)}</h2>` +
    (b.text ? `<p class="lead">${esc(b.text)}</p>` : '') + cta(b.buttonLink, b.buttonLabel) + `</div></section>`,

  blogTeaser: (b, ctx) => {
    const all = ctx.posts;
    const cat = b.category || 'alle';
    const n = Number(b.count) || 3;
    const cards = all
      ? all.filter((p) => cat === 'alle' || p.cat === cat).slice(0, n).map((p) => card(p)).join('')
      : Array.from({ length: n }, () => `<article class="card is-placeholder"><figure></figure><h3 class="h3">Neuester Beitrag${cat !== 'alle' ? ` (${esc(cat)})` : ''}</h3><p class="ex">Hier erscheinen auf der Website automatisch die neuesten Blogbeiträge.</p></article>`).join('');
    return `<section class="blk b-blog"><div class="hd"><div>${head(b)}</div>${cta('/blog/', 'Alle Beiträge ansehen')}</div><div class="grid">${cards}</div></section>`;
  },
};

/**
 * Rendert eine Liste von Blöcken zu HTML.
 * ctx.md(text) → HTML aus Markdown, ctx.asset(path) → Bild-URL, ctx.posts → Beiträge (fehlt in der Vorschau).
 */
export function renderBlocks(blocks = [], ctx = {}) {
  const c = { md: (s) => (s ? esc(s) : ''), asset: (s) => s, posts: null, ...ctx };
  // data-bi = Position des Blocks, damit die CMS-Vorschau zum gewählten Block scrollen kann
  return blocks.map((b, i) => (renderers[b?.type] ? renderers[b.type](b, c).replace(/^<section\b/, `<section data-bi="${i}"`) : '')).join('\n');
}
