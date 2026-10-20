import { Helmet } from 'react-helmet-async';
import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { usePage } from '@/features/pages/usePage';
import { useLang } from '@/i18n/LanguageContext';
import { CompanyStory } from './CompanyStory';

const status = {
  en: { loading: 'Loading…', error: 'This page could not be loaded. Please try again later.', 'not-found': 'This page has not been published in English yet.' },
  vi: { loading: 'Đang tải…', error: 'Không thể tải trang. Vui lòng thử lại sau.', 'not-found': 'Trang này chưa được xuất bản bằng tiếng Việt.' },
};

export function AboutPage() {
  const lang = useLang();
  const s = usePage('about', lang);
  if (s.status !== 'ready') {
    // CMS mode only: the heading is the nav label; the page copy itself is never replaced by bundled text.
    return (
      <DetailLayout lang={lang} title={copy[lang].about} description="">
        {s.status === 'not-found' && <Helmet><meta name="robots" content="noindex" /></Helmet>}
        <section className="section-pad">
          <div className="content-width">
            <p className="cms-status" role={s.status === 'loading' ? 'status' : 'alert'}>{status[lang][s.status]}</p>
          </div>
        </section>
      </DetailLayout>
    );
  }
  const { content, seo } = s.page;
  return (
    <DetailLayout lang={lang} title={content.hero.title} description={content.hero.lead} seo={seo}>
      <CompanyStory content={content} />
    </DetailLayout>
  );
}
