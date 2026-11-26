/** Name und Kurzbeschreibung je Block – gleiche Texte wie im CMS (public/admin/config.yml). */
export const blockInfo: Record<string, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Seitenanfang: große Überschrift, hervorgehobene Zeile, Einleitung, Button, optional Bild rechts.' },
  text: { label: 'Text', description: 'Überschrift links, längerer Text rechts. Für Erklärungen, Listen, Absätze.' },
  imageText: { label: 'Bild mit Text', description: 'Großes Bild neben Überschrift, Text und optionalem Button. Bild links oder rechts.' },
  stats: { label: 'Kennzahlen', description: 'Große Zahlen in einer Reihe, jeweils mit kurzer Beschreibung darunter.' },
  faq: { label: 'FAQ', description: 'Überschrift links, aufklappbare Fragen und Antworten rechts.' },
  cta: { label: 'Call-to-Action', description: 'Umrandeter Kasten mit Überschrift, kurzem Text und Button – meist am Seitenende.' },
  blogTeaser: { label: 'Blog-Teaser', description: 'Die neuesten Blogbeiträge als Karten, optional nach Thema gefiltert.' },
};
