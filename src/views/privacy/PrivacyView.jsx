import { DetailLayout } from '@/components/layout/DetailLayout';
import { PRIVACY_UPDATED, privacyCopy } from '@/data/privacy';
import { privacyMeta } from '../meta';

// Privacy notice page body, shared by both builds.
export function PrivacyView({ lang }) {
  const t = privacyCopy[lang];
  return (
    <DetailLayout lang={lang} {...privacyMeta(lang)} contactCta={false}>
      <section className="section-pad">
        <div className="content-width">
          <div className="privacy-notice">
            {t.sections.map(([heading, paragraphs]) => (
              <section key={heading}>
                <h2>{heading}</h2>
                {paragraphs.map(p => <p key={p}>{p}</p>)}
              </section>
            ))}
            <p className="privacy-updated">
              {t.updated}: <time dateTime={PRIVACY_UPDATED}>{PRIVACY_UPDATED}</time>
            </p>
          </div>
        </div>
      </section>
    </DetailLayout>
  );
}
