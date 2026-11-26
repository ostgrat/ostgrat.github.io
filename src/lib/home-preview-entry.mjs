// Einstieg für die CMS-Vorschau der Startseite: wird von scripts/prepare.mjs zu public/admin/home-preview.js
// gebündelt (klassisches Skript), damit /vorschau/ die Blöcke rendern kann, bevor die Seitenskripte starten.
import { renderHome } from './home-blocks.mjs';
window.OstHome = { render: renderHome };
