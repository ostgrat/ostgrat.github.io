// Läuft vor jedem Build: Schriften aus @fontsource nach public/fonts kopieren
// und public/styles/fonts.css erzeugen. So sind die Schriften selbst gehostet (DSGVO)
// und Website wie CMS-Vorschau nutzen dieselbe Datei.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { buildSync } from 'esbuild';

const fonts = [
  ['ibm-plex-serif', [400, 500]],
  ['space-grotesk', [300, 400, 500, 600]],
  ['jetbrains-mono', [500]],
  ['ibm-plex-mono', [500]],
  ['space-mono', [400]],
  ['vt323', [400]],
];
const subsets = ['latin', 'latin-ext'];

mkdirSync('public/fonts', { recursive: true });
mkdirSync('public/styles', { recursive: true });
let out = '/* Automatisch erzeugt von scripts/prepare.mjs – nicht von Hand bearbeiten. */\n';
for (const [pkg, weights] of fonts) {
  for (const w of weights) {
    const css = readFileSync(`node_modules/@fontsource/${pkg}/${w}.css`, 'utf-8');
    for (const block of css.match(/@font-face\s*{[^}]+}/g) ?? []) {
      const file = block.match(/url\(\.\/files\/([^)]+?\.woff2)\)/)?.[1];
      if (!file || !subsets.some((s) => file.includes(`-${s}-${w}-`))) continue;
      copyFileSync(`node_modules/@fontsource/${pkg}/files/${file}`, `public/fonts/${file}`);
      out += block
        .replace(/src:[^;]+;/, `src: url(/fonts/${file}) format('woff2');`)
        .replace(/\n\s*/g, ' ') + '\n';
    }
  }
}
writeFileSync('public/styles/fonts.css', out);
console.log('Schriften vorbereitet');

// Renderer der Startseiten-Blöcke als klassisches Skript für die CMS-Vorschau (/vorschau/)
buildSync({
  entryPoints: ['src/lib/home-preview-entry.mjs'],
  bundle: true, format: 'iife', minify: true, target: 'es2020',
  outfile: 'public/admin/home-preview.js', logLevel: 'warning',
});
console.log('Vorschau-Renderer gebaut');
