import { pageMetadata } from '@/next/seo';
import { ActivitiesView } from '@/views/activities/ActivitiesView';
import { activitiesMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'vi', path: '/activities', ...activitiesMeta('vi') });

export default function Page() {
  return <ActivitiesView lang="vi" />;
}
