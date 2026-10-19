import { PageMeta } from '@/components/common/PageMeta';
import { useLang } from '@/i18n/LanguageContext';

export function NotFoundPage() {
  const lang = useLang();
  return (
    <>
      <PageMeta
        lang={lang}
        title="Page not found"
        description="Return to HMV Global."
      />
      <div className="not-found">
        <h1>Page not found</h1>
        <a href="/">HMV Global →</a>
      </div>
    </>
  );
}
