# Ostgrat – Website (Testlauf Astro + Sveltia CMS)

Testprojekt für das Kunden-Setup: Astro baut die Seite, Sveltia CMS macht Inhalte editierbar, GitHub Actions veröffentlicht automatisch.

## So hängt alles zusammen

1. Inhalte bearbeiten unter `/admin` (Sveltia CMS).
2. Speichern schreibt die Änderung als Commit auf `main`.
3. GitHub Actions (`.github/workflows/deploy.yml`) baut die Seite und veröffentlicht sie.
4. Nach ca. 1–2 Minuten ist die Änderung live.

## Was wo liegt

| Was | Wo |
| --- | --- |
| Startseite: Rahmen (Navbar, Footer, Skripte) | `src/pages/index.astro`, `src/legacy/top.html`, `bottom.html`, `head.html` |
| Startseite: Blöcke (HTML) | `src/lib/home-blocks.mjs` – dieselben Funktionen rendern die CMS-Vorschau |
| Startseite: Inhalte, Reihenfolge, Hell/Dunkel | `src/data/home.json` (CMS „Startseite“) |
| CMS-Vorschau der Startseite | `src/pages/vorschau.astro` (nicht verlinkt, noindex) |
| Seiten aus dem Baukasten | `src/content/pages/*.md` |
| Block-HTML (Website und CMS-Vorschau) | `src/lib/blocks.mjs`, Styles in `public/styles/site.css` |
| CMS-Seite mit Live-Vorschau | `src/pages/admin/index.astro`, Oberfläche `public/admin/admin.css` |
| Block-Screenshots fürs CMS | `public/uploads/bloecke/` |
| Blogbeiträge je Art | `src/content/blog/artikel`, `warnungen`, `fallstudien` |
| Bilder aus dem CMS | `public/uploads/` |
| CMS-Konfiguration (was editierbar ist) | `public/admin/config.yml` |

## Lokal starten

```
npm install
npm run dev
```

Schriften und das CMS sind selbst gehostet, es gibt keine Google-Fonts- oder CDN-Aufrufe – auch nicht im CMS.
