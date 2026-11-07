import { pageMetadata } from '@/next/seo';
import { ActivitiesView } from '@/views/activities/ActivitiesView';
import { activitiesMeta } from '@/views/meta';

export const metadata = pageMetadata({ lang: 'en', path: '/activities', ...activitiesMeta('en') });

export default function Page() {
  return <ActivitiesView lang="en" />;
}
