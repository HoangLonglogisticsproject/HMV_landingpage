import { createFileRoute, notFound, Outlet } from '@tanstack/react-router';
import { isLocale } from '@/lib/i18n';
import { SiteFooter } from '@/components/sections';

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => { if (!isLocale(params.lang)) throw notFound(); },
  component: LocaleLayout,
});
function LocaleLayout() {
  const { lang } = Route.useParams();
  return <><Outlet />{isLocale(lang) && <SiteFooter locale={lang} />}</>;
}
