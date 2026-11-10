import { DetailLayout } from '@/components/layout/DetailLayout';
import { activitiesMeta } from '../meta';
import { Activities } from './Activities';
import { LogisticsAction } from './LogisticsAction';

// Activities page body, shared by both builds. The photo carousel (Activities) is the client island.
export function ActivitiesView({ lang }) {
  return (
    <DetailLayout lang={lang} {...activitiesMeta(lang)}>
      <Activities lang={lang} full />
      <LogisticsAction lang={lang} />
    </DetailLayout>
  );
}
