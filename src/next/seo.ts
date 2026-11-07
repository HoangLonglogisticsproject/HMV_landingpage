// Next.js-only metadata adapter (Vite: components/common/PageMeta). Titles and descriptions come from the shared
// views/meta.js; URLs from the shared route contract, so canonical, hreflang and links cannot disagree.
import type { Metadata } from 'next';
import { baseUrl } from '@/data/hmv';
import { localizePath } from '@/i18n/routes';

export type Lang = 'en' | 'vi';

// Fail-safe default, as in next.config.ts: noindex unless SITE_INDEXABLE=true (production only, at cutover).
const indexable = process.env.SITE_INDEXABLE === 'true';
const NOINDEX = { index: false, follow: false };

const SITE_NAME = 'HMV Global';
const absolute = (path: string) => `${baseUrl}${path}`;
const OG_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630, alt: 'HMV Global — Rooted in the land. Connecting the world.' };

export const rootMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { template: `%s | ${SITE_NAME}`, default: SITE_NAME },
  icons: { icon: '/favicon.png' },
  robots: indexable ? undefined : NOINDEX,
};

/** Metadata for the page at English key path `path` in `lang`. Both locales exist for every page using this. */
export function pageMetadata({ lang, path, title, description }: { lang: Lang; path: string; title: string; description: string }): Metadata {
  const url = absolute(localizePath(path, lang));
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: absolute(localizePath(path, 'en')),
        vi: absolute(localizePath(path, 'vi')),
        'x-default': absolute(localizePath(path, 'en')),
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: lang === 'vi' ? 'vi_VN' : 'en_US',
      alternateLocale: lang === 'vi' ? 'en_US' : 'vi_VN',
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}
