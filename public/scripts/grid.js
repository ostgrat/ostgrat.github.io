/* Ostgrat – ASCII-Raster und Headline-Effekt für die Unterseiten.
   Vereinfachte Fassung des Rasters der Startseite: gleiche Zellen, Zeichen und Farben,
   Licht unter dem Zeiger mit Nachglühen. Headlines: Buchstaben weichen dem Zeiger seitlich aus. */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S = {cell: 14, ramp: ' .:-=+*#%@', radius: 260, hard: 1.3, inten: 1.15 * .55, amb: .06, grain: .15, decay: .82,
    bg: [15, 14, 18], fg: [54, 53, 61], tint: [241, 238, 232], spread: {radius: 120, amount: 2.2, squash: 2.4}};

  /* ---------- Raster ---------- */
  const cv = document.createElement('canvas');
  cv.className = 'ascii-bg'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(cv);
  const g = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1, cw = 14, ch = 18, cols = 0, rows = 0, seed = [];
  const hist = [];                       /* Nachglühen: frühere Zeigerpositionen */
  let mouse = null, raf = 0, last = 0;

  const size = () => {
    DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    const m = Math.max(2, Math.round(W / (12 * S.cell))), nc = 12 * m;
    cw = W / nc; ch = cw * 1.28; cols = nc; rows = Math.ceil(H / ch) + 1;
    seed = Array.from({length: cols * rows}, () => Math.random());
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    g.font = `500 ${Math.round(cw * .86)}px "JetBrains Mono", ui-monospace, monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    kick();
  };

  const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  const draw = now => {
    raf = 0;
    const t = now / 1000, dt = Math.min(.1, (now - (last || now)) / 1000); last = now;
    if (mouse) hist.push({x: mouse.x, y: mouse.y, f: 1, t: now});
    for (let i = hist.length - 1; i >= 0; i--) { hist[i].f = Math.exp(-(now - hist[i].t) / 1000 * (1 / (1 - S.decay)) * .6); if (hist[i].f < .03) hist.splice(i, 1); }
    if (hist.length > 24) hist.splice(0, hist.length - 24);
    g.fillStyle = mix(S.bg, S.bg, 0); g.fillRect(0, 0, W, H);
    const R = S.radius * (W < 700 ? .6 : 1), last4 = hist.slice(-1)[0];
    for (let r = 0; r < rows; r++) {
      const y = (r + .5) * ch;
      for (let c = 0; c < cols; c++) {
        const x = (c + .5) * cw, k = r * cols + c, sd = seed[k];
        const n = RM ? 0 : (Math.sin(t * .36 * (1 + sd) + sd * 40) * .5) * S.grain;
        let b = S.amb + n * S.amb * 3, glow = 0;
        for (const h of hist) { const d = Math.hypot(x - h.x, y - h.y) / R; if (d < 1) glow = Math.max(glow, S.inten * h.f * Math.pow(1 - d, S.hard)); }
        if (last4 && mouse) { const d = Math.hypot(x - mouse.x, y - mouse.y) / R; if (d < 1) glow = Math.max(glow, S.inten * Math.pow(1 - d, S.hard)); }
        b = Math.max(0, Math.min(1, b + glow * (.85 + .3 * sd)));
        const ci = Math.round(b * (S.ramp.length - 1)); if (!ci) continue;
        g.fillStyle = mix(S.fg, S.tint, Math.min(1, glow * 1.2));
        g.fillText(S.ramp[ci], x, y);
      }
    }
    if (mouse || hist.length) kick(); else if (!RM) setTimeout(kick, 600);   /* ruhig: Körnung langsam weiter */
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('resize', size);
  addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; mouse = {x: e.clientX, y: e.clientY}; kick(); spreadKick(); }, {passive: true});
  document.addEventListener('pointerleave', () => { mouse = null; spreadKick(); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(size);
  size();

  /* ---------- Headlines: Buchstaben weichen seitlich aus ---------- */
  const chars = [];
  for (const h of document.querySelectorAll('main h1, main h2, main h3')) {
    const walk = node => {
      for (const n of [...node.childNodes]) {
        if (n.nodeType === 1) { walk(n); continue; }
        if (n.nodeType !== 3) continue;
        const frag = document.createDocumentFragment();
        for (const w of n.textContent.split(/(\s+)/)) {
          if (!w) continue;
          if (/^\s+$/.test(w)) { frag.append(w); continue; }
          const wr = document.createElement('span'); wr.style.whiteSpace = 'nowrap';
          for (const chr of w) { const i = document.createElement('i'); i.className = 'sp-c'; i.textContent = chr; wr.append(i); chars.push({el: i, ox: 0}); }
          frag.append(wr);
        }
        n.replaceWith(frag);
      }
    };
    walk(h);
  }
  let sRaf = 0;
  const spread = () => {
    sRaf = 0; let busy = false;
    const {radius: SR, amount: SA, squash} = S.spread;
    for (const c of chars) {
      const r = c.el.getBoundingClientRect();
      if ((r.bottom < -40 || r.top > innerHeight + 40) && !c.ox) continue;
      let goal = 0;
      if (mouse && !RM) { const x = r.left + r.width / 2 - c.ox, dx = x - mouse.x, d = Math.hypot(dx, (r.top + r.height / 2 - mouse.y) * squash) / SR;
        if (d < 1) { const s = 1 - d; goal = SA * s * s * (3 - 2 * s) * Math.tanh(dx / 26); } }
      const nv = c.ox + (goal - c.ox) * .18, v = Math.abs(goal - nv) < .05 ? goal : nv;
      if (v !== c.ox) { c.ox = v; c.el.style.left = v.toFixed(2) + 'px'; }
      if (v !== goal) busy = true;
    }
    if (busy) sRaf = requestAnimationFrame(spread);
  };
  const spreadKick = () => { if (!sRaf && chars.length) sRaf = requestAnimationFrame(spread); };
})();
