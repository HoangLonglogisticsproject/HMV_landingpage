// Bundled website page copy in the shape the CMS public pages API serves. Pure: shared by Vite and Next.js.
import { about } from '@/data/about';

const BUNDLED = { about };

export function bundledPage(key, lang) {
  const content = BUNDLED[key][lang];
  return { status: 'ready', page: { content, seo: { title: content.hero.title, description: content.hero.lead } } };
}
