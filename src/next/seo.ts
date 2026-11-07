// Next.js-only metadata adapter (Vite: components/common/PageMeta). Titles and descriptions come from the shared
// views/meta.js; URLs from the shared route contract, so canonical, hreflang and links cannot disagree.
import type { Metadata } from 'next';
import { baseUrl } from '@/data/hmv';
import { LOCALES, localizePath } from '@/i18n/routes';

export type Lang = 'en' | 'vi';

// Fail-safe default, as in next.config.ts: noindex unless SITE_INDEXABLE=true (production only, at cutover).
const indexable = process.env.SITE_INDEXABLE === 'true';
const NOINDEX = { index: false, follow: false };

const SITE_NAME = 'HMV Global';

/**
 * The one formatter for absolute page URLs: canonical, hreflang, og:url and the sitemap all use it, so they are the
 * same strings. The root is the bare origin, which is also how Next.js writes it in head tags.
 */
export function absoluteUrl(path: string, lang: Lang) {
  const localized = localizePath(path, lang);
  return localized === '/' ? baseUrl : `${baseUrl}${localized}`;
}
const OG_LOCALE = { en: 'en_US', vi: 'vi_VN' };
const OG_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630, alt: 'HMV Global — Rooted in the land. Connecting the world.' };

export const rootMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { template: `%s | ${SITE_NAME}`, default: SITE_NAME },
  icons: { icon: '/favicon.png' },
  robots: indexable ? undefined : NOINDEX,
};

/** English key path of a page per locale; only the locales the page exists in. */
export type LocalePaths = Partial<Record<Lang, string>>;

/**
 * The page's hreflang set, also its sitemap alternates: absolute URL per locale plus `x-default` (English). Empty when
 * the page exists in one locale only (SEO spec §7.3).
 */
export function alternateUrls(paths: LocalePaths): Record<string, string> {
  const langs = (LOCALES as Lang[]).filter(lang => paths[lang]);
  if (langs.length < 2) return {};
  const urls = Object.fromEntries(langs.map(lang => [lang, absoluteUrl(paths[lang]!, lang)]));
  return { ...urls, 'x-default': urls.en };
}

/**
 * Metadata for the page at English key path `path` in `lang`. `languages`: the key path per locale when the page
 * does not exist in both locales under the same key (CMS articles). `noindex`: a not-published state, which gets
 * no canonical or alternates.
 */
export function pageMetadata({ lang, path, title, description, languages = { en: path, vi: path }, noindex = false }: {
  lang: Lang;
  path: string;
  title: string;
  description: string;
  languages?: LocalePaths;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path, lang);
  const fullTitle = `${title} | ${SITE_NAME}`;
  const other: Lang = lang === 'vi' ? 'en' : 'vi';
  return {
    title,
    description,
    ...(noindex ? { robots: NOINDEX } : { alternates: { canonical: url, languages: alternateUrls(languages) } }),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url,
      locale: OG_LOCALE[lang],
      alternateLocale: languages[other] ? OG_LOCALE[other] : undefined,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}
