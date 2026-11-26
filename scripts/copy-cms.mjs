// Kopiert Sveltia CMS aus node_modules nach public/admin, damit das CMS selbst gehostet ist (kein CDN).
import { cpSync, mkdirSync } from 'node:fs';

const from = 'node_modules/@sveltia/cms/dist';
const to = 'public/admin';
mkdirSync(to, { recursive: true });
cpSync(`${from}/sveltia-cms.js`, `${to}/sveltia-cms.js`);
cpSync(`${from}/chunks`, `${to}/chunks`, { recursive: true, filter: (p) => !p.endsWith('.map') });
console.log('Sveltia CMS nach public/admin kopiert');
