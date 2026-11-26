import { marked } from 'marked';
/** Markdown aus CMS-Feldern zu HTML. */
export const md = (s?: string) => (s ? (marked.parse(s, { async: false }) as string) : '');
