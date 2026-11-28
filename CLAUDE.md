# CLAUDE.md – Ostgrat Website

Astro-Seite mit Sveltia CMS, Deploy über GitHub Actions auf GitHub Pages. Mehrere Claude-Sitzungen arbeiten parallel auf `main`: vor jeder Arbeit `git pull`, vor jedem Push nochmal.

## Startseite: wo was liegt

Die Startseite besteht aus Blöcken, die im CMS sortiert, entfernt und hinzugefügt werden können. Es gibt **keine** `src/legacy/body-*.html` mehr.

| Was | Datei |
| --- | --- |
| HTML der Sections (11 Blöcke) | `src/lib/home-blocks.mjs` |
| SVGs der Sections | `src/lib/home-svgs.mjs` |
| Navbar, Seitenrahmen vor den Blöcken | `src/legacy/top.html` |
| Footer, Popups, alle Seitenskripte | `src/legacy/bottom.html` |
| `<head>` | `src/legacy/head.html` |
| Styles | `<style>` in `src/legacy/head.html` |
| Inhalte, Reihenfolge, Hell/Dunkel | `src/data/home.json` (wird vom CMS überschrieben) |
| Felder im CMS | `public/admin/config.yml`, Collection „Startseite“ |
| Bilder und Videos der Startseite | `public/uploads/start/` |

`home-blocks.mjs` rendert die Startseite, alle Seiten aus dem CMS und die CMS-Vorschau (`src/pages/vorschau.astro`). Eine Änderung dort gilt überall.

Alle Seiten (Startseite, CMS-Seiten, Blog) laufen durch denselben Rahmen `src/components/FramePage.astro`: Head, Navbar, ASCII-Raster, Footer und Seitenskripte wie auf der Startseite. Sprungmarken wie `#team` zeigen auf Unterseiten automatisch auf die Startseite, wenn es das Ziel dort nicht gibt.

## Regeln für Änderungen an der Startseite

- **Texte nicht ins HTML schreiben.** Jeder Text, den der Kunde ändern soll, kommt aus `home.json` und braucht ein Feld in `config.yml`. Neues Feld = beide Dateien anpassen.
- **Jeder Block muss entfernbar sein.** Skripte in `bottom.html` dürfen nicht davon ausgehen, dass ein bestimmtes Element existiert. Vor dem Zugriff prüfen (`if (!el) return;`, `el && …`).
- **Hell/Dunkel** kommt aus dem Feld `theme` jedes Blocks (`data-theme="hell|dunkel"` am Block-Element). Die Scroll-Logik in `bottom.html` (`frame()`) liest nur dieses Attribut. Keine festen Section-IDs für den Farbwechsel einbauen.
- **Block-Attribute:** jeder Block trägt `data-bi` (Position), `data-block` (Typ), `data-theme`. `data-i` ist von den Seitenskripten belegt, nicht für Blöcke verwenden.
- **Globus** darf nur einmal pro Seite vorkommen, die Progress Section (`.s2`) mehrfach.
- **Neuer Block:** Renderer in `home-blocks.mjs`, Typ in `config.yml` (mit `theme`-Feld und Screenshot-Feld `ansicht`), Eintrag in `home.json`, Screenshot unter `public/uploads/bloecke/start-<typ>.jpg`.
- **Design geändert?** Dann sind die Block-Screenshots in `public/uploads/bloecke/` veraltet. Neu aufnehmen oder im Commit erwähnen.

## Sprachen (Deutsch / Englisch)

Deutsch ist Standard (ohne Präfix), Englisch liegt unter `/en/`.

| Was | Wo |
| --- | --- |
| Startseite EN | `src/data/home.en.json` (gleicher Aufbau wie `home.json`; fehlt sie, gilt Deutsch) |
| Seiten und Blog EN | gleiche Datei mit `.en.md`, z. B. `nis2-check.en.md`, `artikel/name.en.md` |
| Englische Adressen | Feld `urlSlug` in der `.en.md`; Blog-Ordner auf Englisch: articles, alerts, case-studies (`typePathEn` in `src/lib/blog.ts`) |
| Feste Oberflächentexte (Navbar, Footer, Popups, Vorlagen, Skripte) | `src/i18n/en.json`: deutscher Text genau wie im Code → Englisch |
| Übersetzung beim Rendern, Links auf `/en/` umschreiben | `src/middleware.ts` + `src/i18n/index.mjs` |
| CMS | `i18n` in `config.yml` (multiple_files, Standard ohne Sprachendung); Textfelder `i18n: true`, Block-Listen `i18n: duplicate` |

- **Neuer fester Text im HTML oder Skript?** Deutschen Text 1:1 als Schlüssel in `src/i18n/en.json` eintragen. Englische Übersetzungen dürfen in Skript-Strings mit einfachen Anführungszeichen keinen Apostroph enthalten.
- **Neues Textfeld im CMS?** `i18n: true` dazuschreiben, sonst ist es auf Englisch nicht bearbeitbar.
- Asset-Pfade immer absolut (`/img/…`), relative Pfade brechen unter `/en/`.

## Unterseiten

- **Seiten aus dem CMS** (`src/content/pages/*.md`, Sammlung „Seiten“) nutzen genau dieselben Blöcke wie die Startseite (`types: *homeblocks` in `config.yml`). Es gibt keinen eigenen Seitenbaukasten mehr; keine neuen Blocktypen nur für Unterseiten anlegen.
- **Blog-Übersicht** (`src/pages/blog/index.astro`) ist der Insights-Block mit `all: true`.
- **Blogbeitrag** (`src/components/PostPage.astro`): eigenes Markup im Rahmen, Styles unter `.pst` in `head.html`. Kein `<header>`-Element verwenden, das ist die Navbar.
- Die Klasse `.sub` ist die Subline-Schrift, nicht für Seitenzustände verwenden (Unterseiten tragen `body.pg-sub`).

## Prüfen vor dem Push

- `npm run build` muss durchlaufen.
- Startseite auf 1440 und 390 px ohne Fehler in der Konsole.
- Bei Änderungen an `bottom.html`: Seite mit `/vorschau/?ohne=globus,hero` o. ä. testen (entfernt Blöcke), es darf keinen Fehler geben.

## Commit-Messages

Erste Zeile: plakative Zusammenfassung aller Änderungen. Dann Leerzeile, dann die Änderungen, nach jedem Semikolon ein Zeilenumbruch. Sachlich und präzise.
