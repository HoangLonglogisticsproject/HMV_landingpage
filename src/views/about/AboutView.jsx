import { DetailLayout } from '@/components/layout/DetailLayout';
import { copy } from '@/data/hmv';
import { CompanyStory } from './CompanyStory';

const status = {
  en: { loading: 'Loading…', error: 'This page could not be loaded. Please try again later.', 'not-found': 'This page has not been published in English yet.' },
  vi: { loading: 'Đang tải…', error: 'Không thể tải trang. Vui lòng thử lại sau.', 'not-found': 'Trang này chưa được xuất bản bằng tiếng Việt.' },
};

// About page body, shared by both builds. `state` is a usePage('about') result: bundled copy, or the CMS page.
export function AboutView({ lang, state }) {
  if (state.status !== 'ready') {
    // CMS mode only: the heading is the nav label; the page copy itself is never replaced by bundled text.
    return (
      <DetailLayout lang={lang} title={copy[lang].about} description="">
        <section className="section-pad">
          <div className="content-width">
            <p className="cms-status" role={state.status === 'loading' ? 'status' : 'alert'}>{status[lang][state.status]}</p>
          </div>
        </section>
      </DetailLayout>
    );
  }
  const { content } = state.page;
  return (
    <DetailLayout lang={lang} title={content.hero.title} description={content.hero.lead}>
      <CompanyStory content={content} />
    </DetailLayout>
  );
}
