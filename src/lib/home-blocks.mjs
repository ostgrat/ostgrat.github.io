// Startseiten-Blöcke: erzeugt das HTML jeder Section der Ostgrat-Startseite aus den CMS-Daten.
// Wird von der Website (src/pages/index.astro) UND von der CMS-Vorschau (/vorschau/) benutzt.
// Markup 1:1 aus dem Design-Entwurf; Styles und Effekte liegen in src/legacy/head.html und bottom.html.
// Jeder Block bekommt data-theme (hell/dunkel, steuert den Farbwechsel beim Scrollen) und data-bi (Position, für die Vorschau).

import S from './home-svgs.mjs';

const ALERT = "<span class=\"bl-alert\"><i></i>Sicherheitswarnung</span>";

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Kurztext mit Mini-Formatierung: [Text](#ziel) wird zum Link, **fett** wird fett. */
const inl = (s, { inLink = false } = {}) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) =>
      inLink
        ? `<span class="tlink" role="link" tabindex="0" data-href="${href}">${t}</span>`   // in Karten, die selbst Links sind
        : `<a class="tlink" href="${href}">${t}</a>`);

const lines = (s) => esc(s).replace(/\r?\n/g, '<br>');
const list = (a) => (Array.isArray(a) ? a.filter(Boolean) : []);
const pick = (arr, i) => arr[i % arr.length];
const n2 = (i) => String(i + 1).padStart(2, '0');
const arrow = S.hero[0];
const cta = (cls, href, label) =>
  label ? `<a class="cta${cls ? ' ' + cls : ''}" href="${esc(href || '#kontakt')}"><b><span>${esc(label)}</span></b><i>${arrow}</i></a>` : '';
const img = (src, asset) => esc(asset(src || ''));

const CERT_COLORS = [
  'var(--p-acc,#f0704f)', 'var(--p-army2,#a4b26c)', 'color-mix(in srgb,var(--p-acc,#f0704f) 55%,var(--p-lt,#ebe9e4))',
  'var(--p-army,#4b5320)', 'color-mix(in srgb,var(--p-acc,#f0704f) 70%,var(--p-dk,#0f0e12))',
];

/** Standard-Farbe je Block, wenn im CMS nichts gewählt ist (entspricht dem Entwurf). */
export const defaultTheme = {
  hero: 'dunkel', fakten: 'hell', team: 'hell', nis2: 'hell', redteam: 'hell', warum: 'dunkel',
  services: 'dunkel', globus: 'dunkel', insights: 'dunkel', faq: 'dunkel', kontakt: 'dunkel',
};

const R = {
  hero: (b, c) => `<section class="hero">
    <div class="copy">
      <h1><span class="ln">${esc(b.line1)}</span> <span class="ln">${esc(b.line2)}</span> <span class="ln hl typing">${esc(b.highlight)}</span></h1>
      <p class="hero-k sub">${esc(b.kicker)}</p>
      <p class="lead">${esc(b.lead)}</p>
      ${cta('', b.ctaLink, b.ctaLabel)}
    </div>
    <div class="mon" id="mon" aria-hidden="true">
      <canvas></canvas>
      <div class="inc"><i></i><span>Incident recorded</span></div>
    </div>
    <div class="h2m" aria-label="Team bei der Arbeit an einem Industrieroboter">
      <div class="h2box" id="h2box"><canvas id="pxc" aria-hidden="true"></canvas></div>
    </div>
    <div class="tick" id="tick" aria-label="Leistungen"><div class="tick-r"><div class="tick-g">${list(b.ticker).map((t) => `<span>${inl(t)}</span>`).join('')}</div></div></div>
  </section>`,

  fakten: (b, c) => `<section class="why" id="fakten" aria-labelledby="h-fakten">
    <div class="why-top">
      <div class="why-c"><h2 id="h-fakten" class="why-h">${lines(b.heading)}</h2>
        <p class="why-sub">${esc(b.sub)}</p>
        <p class="why-p">${inl(b.text)}</p>
        ${list(b.services).length ? `<ol class="ti-steps why-svc">${list(b.services).map((s, i) => `<li><span class="n">${n2(i)}</span><span><b>${esc(s.title)}</b> ${esc(s.text)}</span></li>`).join('')}</ol>` : ''}
        ${b.ctaLabel || b.linkLabel ? `<div class="why-acts">${cta('why-cta', b.ctaLink, b.ctaLabel)}${b.linkLabel ? `<a class="tlink why-tl" href="${esc(b.linkHref || '#')}">${esc(b.linkLabel)}</a>` : ''}</div>` : ''}<ul class="why-logos" aria-label="Zertifizierungen" data-pin="certs" data-pin-label="Zertifizierungen: Farbe" data-pin-variants='[{"v":"A","label":"Monochrom"},{"v":"B","label":"Original"}]'>${list(b.logos).map((l) => `<li><img src="${img(l.image, c.asset)}" alt="${esc(l.alt)}" style="height:${Number(l.height) || 32}px" loading="lazy"></li>`).join('')}</ul>
        </div>
      <div class="why-side"><dl class="why-stats">${list(b.stats).map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd></div>`).join('')}</dl></div></div>
    <ul class="why-certs" aria-label="Zertifizierungen">${list(b.certs).map((x, i) => `<li style="--sc:${pick(CERT_COLORS, i)}" tabindex="0">${pick(S.fakten.slice(1), i)}<span class="wc-t"><span><b>${esc(x.title)}</b><small>${esc(x.subtitle)}</small></span></span></li>`).join('')}</ul>
    <div class="why-fig"><canvas class="why-chart" aria-hidden="true"></canvas></div>
  </section>`,

  team: (b, c) => `<section class="team" id="team" aria-labelledby="h-team" data-pin="team-layout" data-pin-label="Team: Layout" data-pin-variants='[{"v":"A","label":"Text über dem Bild"},{"v":"B","label":"Bild bildschirmfüllend"},{"v":"C","label":"Porträt-Raster"}]'>
    <div class="team-head">
      <div><h2 id="h-team">${esc(b.heading)}</h2></div>
      <div class="team-side"><p class="team-lead">${esc(b.lead)} <span class="team-hint">${esc(b.hint)}</span></p>
        ${cta('team-cta', b.ctaLink, b.ctaLabel)}</div>
    </div>
    <div class="team-fig">
      <div class="team-img"><div class="team-move"><img src="${img(b.image, c.asset)}" alt="${esc(b.imageAlt)}" width="2000" height="1170"></div></div>
      <div class="team-grad" aria-hidden="true"></div>
      ${S.team[1]}
      <div class="team-tag" aria-live="polite"></div>
      <div class="team-about" aria-hidden="true"><span class="ab-h"><span class="lab">About</span>${S.team[2]}</span></div>
    </div>
      <div class="team-wall" aria-label="Porträts aus dem Team">
      <div class="tw-strip"></div>
      <figure class="tw-feat"><div class="tw-ph"></div></figure>
      <div class="tw-info"><p class="tw-name"><b></b> <span></span></p><p class="tw-lead">${esc(b.lead)}</p></div>
    </div>
  </section>`,

  nis2: (b, c) => `<section class="ti" id="nis2-umsetzen" aria-labelledby="h-ti">
    <div class="ti-grid">
      <figure class="ti-img"><div class="ti-card"><img src="${img(b.image, c.asset)}" alt="${esc(b.imageAlt)}" loading="lazy"></div></figure>
      <div class="ti-c">
        <h2 id="h-ti">${esc(b.heading)}</h2>
        <p class="ti-p">${inl(b.text)}</p>
        <ol class="ti-steps">
          ${list(b.steps).map((s, i) => `<li><span class="n">${n2(i)}</span><span><b>${esc(s.title)}</b> ${esc(s.text)}</span></li>`).join('\n          ')}
        </ol>
        ${cta('ti-cta', b.ctaLink, b.ctaLabel)}
      </div>
    </div>
  </section>`,

  redteam: (b, c) => `<section class="s2" id="redteam" aria-labelledby="h-redteam">
    <div class="s2-pin">
      <div class="s2-text">
        <h2 id="h-redteam">${esc(b.heading)}${b.headingAccent ? ` <em class="red">${esc(b.headingAccent)}</em>` : ''}</h2>
        <p>${inl(b.text)}</p>
        ${cta('s2-cta', b.ctaLink, b.ctaLabel)}
        <ol class="s2-list">
          <i class="s2-bar" aria-hidden="true"></i><i class="s2-tip" aria-hidden="true"></i>
          ${list(b.steps).map((s, i) => `<li class="${i === 0 ? 'on' : 'next'}"><figure class="li-pic"><img src="${img(s.image, c.asset)}" alt="${esc(s.imageAlt)}" loading="lazy"></figure><h3>${pick(S.redteam.slice(1), i)}<span class="hl">${esc(s.title)}</span></h3><p>${inl(s.text)}</p></li>`).join('\n          ')}
        </ol>
      </div>
      <div class="s2-media">
        <div class="ring">
          <figure class="rcard" style="margin:0;opacity:1"><div class="rimg"><canvas class="pxs" role="img" aria-label="Bild zum aktiven Punkt"></canvas></div><div class="rglass"><span>Keep scrolling</span></div></figure>
        </div>
      </div>
    </div>
  </section>`,

  warum: (b, c) => `<section class="rev" id="warum" aria-labelledby="h-warum">
    <div class="rev-in">
      <div class="rev-bg" aria-hidden="true"><video disablepictureinpicture disableremoteplayback src="/img/verlauf.mp4" poster="/img/verlauf.jpg" muted loop playsinline preload="none"></video></div>
      <i class="rev-ln h t" aria-hidden="true"></i><i class="rev-ln h b" aria-hidden="true"></i><i class="rev-ln v l" aria-hidden="true"></i><i class="rev-ln v r" aria-hidden="true"></i>
      <div class="rev-c">
        <h2 id="h-warum" class="rev-h">${esc(b.heading)}</h2>
        <div class="why-grid">
      ${list(b.cards).map((k, i) => `<a class="why-card" href="${esc(k.link || '#kontakt')}">${pick(S.warum, i)}<p class="lab">${esc(k.label)}</p><p>${inl(k.text, { inLink: true })}</p></a>`).join('\n      ')}
      <b hidden class="v" style="left:0"></b><b hidden class="v" style="left:33.333%"></b><b hidden class="v" style="left:66.666%"></b><b class="v" style="right:0"></b>
    </div>
      </div>
    </div>
  </section>`,

  services: (b, c) => `<section class="sv" id="services" aria-labelledby="h-sv">
    <div class="sv-top"><div class="sv-hd"><h2 id="h-sv"><span>${esc(b.line1)}</span> <span>${esc(b.line2)}</span></h2></div><p>${inl(b.intro)}</p></div>
    <ol class="sv-list" data-v="4" data-pin="sv-cols" data-pin-label="Leistungen: Darstellung" data-pin-variants='[{"v":"4","label":"Video, scrollend"},{"v":"1","label":"1 Spalte"},{"v":"2","label":"2 Spalten"},{"v":"3","label":"3 Spalten"}]'>
      ${list(b.items).map((it, i) => {
        const vid = c.asset(it.video || '');
        const clip = vid.split('/').pop();
        return `<li class="sv-row"${it.anchor ? ` id="${esc(it.anchor)}"` : ''}><figure class="sv-ill" aria-hidden="true">${S.services[0]}</figure><div class="sv-vid" aria-hidden="true" data-clip="${esc(clip)}"><video muted loop playsinline disablepictureinpicture disableremoteplayback preload="none" poster="${img(it.poster, c.asset)}" src="${esc(vid)}"></video></div>
        <div class="sv-c"><p class="sv-n">${n2(i)}</p><h3>${esc(it.title)}</h3><p class="sv-txt">${inl(it.text)}</p></div>
        <div class="sv-side"><dl class="sv-m"><div><dt class="lab">${esc(it.label1)}</dt><dd>${esc(it.value1)}</dd></div><div><dt class="lab">${esc(it.label2)}</dt><dd>${esc(it.value2)}</dd></div></dl><a class="sv-go" href="${esc(it.link || '#kontakt')}" aria-label="${esc(it.title)} anfragen">${S.services[1]}</a></div></li>`;
      }).join('\n      ')}
    </ol>
  </section>`,

  // Globus: einmal pro Seite. Die äußere Hülle #gscroll ist die Scrollstrecke für die Drehung.
  globus: (b, c) => `<div id="gscroll"><section id="globe-section" aria-label="Unsere Kunden – rotierender Pixel-Globus">
  <h2 class="sr">${esc(b.srHeading)}</h2>
  <canvas id="globe" aria-hidden="true"></canvas>
  <div class="gbox" id="gbox" aria-hidden="true"></div>
  <div class="gcopy" id="gcopy">
    <h2><span>${esc(b.line1)}</span> <span>${esc(b.line2)}</span></h2>
    <p class="gx-sub">${esc(b.sub)}</p>
    <p>${inl(b.text)}</p>
    <div class="gx" id="branchen">${list(b.branches).map((x) => `<details name="branche"><summary><b>${esc(x.title)}</b><span>${esc(x.subtitle)}</span><i>${S.globus[0]}</i></summary><p>${inl(x.text)}</p></details>`).join('')}</div>
  </div>
  <canvas id="gfx" aria-hidden="true"></canvas>
  <div class="labels" id="glabels" aria-hidden="true"></div>
  <div class="gdrag" id="gdrag" aria-hidden="true" hidden></div>
  <div class="panel hidden" id="gpanel">
    <h2><span>Globus-Parameter</span><span>H</span></h2>
    <div class="row"><label>Dichte <b id="gv-density"></b></label><input id="gdensity" type="range" min="50" max="200" step="2" value="96"></div>
    <div class="row"><label>Rotation <b id="gv-speed"></b></label><input id="gspeed" type="range" min="0" max="20" step="0.5" value="4"></div>
    <div class="row"><label>Maus-Einfluss <b id="gv-mouse"></b></label><input id="gmouse" type="range" min="0" max="3" step="0.1" value="1"></div>
    <p class="hint">Taste H blendet das Panel aus.</p>
  </div>
</section></div>`,

  insights: (b, c) => {
    const n = b.all ? 999 : Math.max(1, Math.min(12, Number(b.count) || 6));   /* all: Blog-Übersicht zeigt alle */
    const posts = (c.posts || []).slice(0, n);
    const cards = posts.map((p) => `<article class="bl-card${p.alert ? ' is-alert' : ''}" data-cat="${esc(p.cat)}" data-date="${esc(p.iso)}"><a class="bl-hit" href="${esc(p.url)}" aria-label="${esc(p.title)}"></a><figure class="bl-img">${p.coverSvg || (p.cover ? `<img src="${esc(p.cover)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">` : '')}${p.alert ? ALERT : ''}</figure><h3>${esc(p.title)}</h3><p class="bl-ex">${esc(p.excerpt)}</p><div class="bl-meta"><span>${esc(p.author)}</span><span>${esc(p.dateText)}</span></div></article>`).join('');
    return `<section class="bl" id="insights" aria-labelledby="h-bl">
    <div class="bl-hd"><div><h2 id="h-bl">${esc(b.heading)}</h2><p class="bl-k sub">${esc(b.kicker)}</p></div>${b.all ? '' : cta('bl-cta', '/blog/', b.ctaLabel)}</div>
    <div class="bl-bar">
      <div class="bl-tabs" role="tablist" aria-label="Kategorien"><button type="button" role="tab" data-f="alle" aria-selected="true"><span>Alle</span></button><button type="button" role="tab" data-f="warnung" aria-selected="false"><span>Warnungen</span></button><button type="button" role="tab" data-f="soc" aria-selected="false"><span>SOC</span></button><button type="button" role="tab" data-f="redteam" aria-selected="false"><span>Red Team</span></button><button type="button" role="tab" data-f="ot" aria-selected="false"><span>OT</span></button><button type="button" role="tab" data-f="compliance" aria-selected="false"><span>Compliance</span></button></div>
      <div class="bl-tools"><label class="bl-search"><span class="sr">Artikel durchsuchen</span><input type="search" placeholder="Suchen …" tabindex="-1"></label><button type="button" class="bl-ic" data-act="search" aria-label="Suche öffnen" aria-expanded="false">${S.insights[1]}</button></div>
    </div>
    <div class="bl-grid">${cards}</div>
    <p class="bl-empty" hidden>Keine Artikel gefunden.</p>
    ${b.all ? '' : `<p class="bl-more"><a class="tlink" href="/blog/">${esc(b.ctaLabel || 'Alle Beiträge ansehen')}</a></p>`}
  </section>`;
  },

  faq: (b, c) => `<section class="fq" id="faq" aria-labelledby="h-fq">
    <div class="fq-l"><h2 id="h-fq">${esc(b.heading)}</h2><div class="fq-box"><p class="fq-bs">${inl(b.boxText)}</p>${b.email ? `<a class="cta fq-cta" href="mailto:${esc(b.email)}"><b><span>${esc(b.email)}</span></b><i>${arrow}</i></a>` : ''}</div></div>
    <div class="fq-list">${list(b.items).map((it, i) => `<details name="faq"${i === 0 ? ' open' : ''}><summary><h3>${esc(it.question)}</h3><i>${S.faq[1]}</i></summary><p>${inl(it.answer)}</p></details>`).join('')}</div>
  </section>`,

  kontakt: (b, c) => `<section class="ct" id="kontakt" aria-labelledby="h-kontakt">
    <div class="ct-grid">
      <div class="ct-l">
        <div class="ct-hd"><h2 id="h-kontakt">${esc(b.heading)}</h2><p class="ct-sub">${esc(b.sub)}</p></div>
        <ul class="ct-opts">
          ${list(b.options).map((o) => `<li${o.hot ? ' class="hot"' : ''}><span class="lab">${esc(o.label)}</span>${o.link ? `<a href="${esc(o.link)}">${esc(o.value)}</a>` : `<span>${esc(o.value)}</span>`}</li>`).join('\n          ')}
        </ul>
      </div>
      <div class="ct-r">
        <div class="ct-bgv" aria-hidden="true"><video disablepictureinpicture disableremoteplayback src="/img/verlauf.mp4" poster="/img/verlauf.jpg" muted loop playsinline preload="none"></video>
          ${S.kontakt[0]}</div>
        <form class="ct-form" aria-live="polite" data-pin="kontakt-ausrichtung" data-pin-label="Kontakt · Ausrichtung am Handy" data-pin-variants='[{"v":"A","label":"Links"},{"v":"B","label":"Zentriert"}]'>
          <div class="ct-row">
            <label class="ct-f"><span class="lab">Name</span><input name="name" autocomplete="name" placeholder="Maria Huber" required></label>
            <label class="ct-f"><span class="lab">Geschäftliche E-Mail</span><input type="email" name="email" autocomplete="email" placeholder="m.huber@firma.at" required></label>
          </div>
          <div class="ct-row">
            <label class="ct-f"><span class="lab">Unternehmen</span><input name="company" autocomplete="organization" placeholder="Muster GmbH" required></label>
            <label class="ct-f"><span class="lab">Ihre Rolle</span><input name="role" autocomplete="organization-title" placeholder="z. B. IT-Leitung, CISO"></label>
          </div>
          <label class="ct-f"><span class="lab">Worum geht es?</span><span class="ct-sel"><select name="topic" required><option value="" disabled selected>Thema wählen</option>${list(b.topics).map((t) => `<option>${esc(t)}</option>`).join('')}</select>${S.kontakt[1]}</span></label>
          <label class="ct-f"><span class="lab">Nachricht <em>optional</em></span><textarea name="message" rows="3" placeholder="Systeme, Zeitrahmen, offene Fragen …"></textarea></label>
          <button class="cta ct-send" type="submit"><b><span>${esc(b.sendLabel || 'Anfrage absenden')}</span></b><i>${arrow}</i></button>
          <p class="ct-legal">${inl(b.legal).replace(/<a class="tlink" /g, '<a ')}</p>
        </form>
      </div>
    </div>
  </section>`,
};

export const homeBlockTypes = Object.keys(R);

/**
 * Rendert die Startseiten-Blöcke zu HTML.
 * ctx.posts → Beiträge für „Insights“, ctx.asset(path) → Bild-/Video-URL (Vorschau: frisch hochgeladene Dateien).
 */
export function renderHome(blocks = [], ctx = {}) {
  const c = { asset: (s) => s, posts: [], ...ctx };
  let globe = false;
  return list(blocks).map((b, i) => {
    const r = R[b?.type];
    if (!r) return '';
    if (b.type === 'globus') { if (globe) return ''; globe = true; }   // Globus nur einmal pro Seite
    const theme = b.theme === 'hell' || b.theme === 'dunkel' ? b.theme : defaultTheme[b.type];
    // erstes Tag des Blocks mit Position, Typ und Farbe markieren
    return r(b, c).replace(/^<(section|div)\b/, `<$1 data-bi="${i}" data-block="${b.type}" data-theme="${theme}"`);
  }).join('\n');
}
