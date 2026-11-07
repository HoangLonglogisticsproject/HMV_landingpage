// Page titles and descriptions, shared by the Vite head tags (PageMeta) and Next.js route metadata, so both
// builds emit the same values. Titles are without the " | HMV Global" suffix that both add.
import { copy } from '@/data/hmv';

export const homeMeta = lang => ({
  title: lang === 'vi' ? 'Chuỗi cung ứng nông nghiệp & thương mại quốc tế' : 'Agricultural Supply Chain & Global Trading',
  description: copy[lang].storyText,
});

// `state` is a usePage() result. Until the page is ready (CMS mode) the heading is the nav label.
export const aboutMeta = (lang, state) =>
  state.status === 'ready'
    ? {
        title: state.page.seo?.title || state.page.content.hero.title,
        description: state.page.seo?.description || state.page.content.hero.lead,
      }
    : { title: copy[lang].about, description: '' };

export const contactMeta = lang => ({ title: copy[lang].contact, description: copy[lang].contactText });

export const notFoundMeta = { title: 'Page not found', description: 'Return to HMV Global.' };
