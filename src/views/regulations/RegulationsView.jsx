import { DetailLayout } from '@/components/layout/DetailLayout';
import { Regulations } from '@/features/regulations/Regulations';
import { regulationsMeta } from '../meta';

// Regulations page body, shared by both builds.
export function RegulationsView({ lang }) {
  return (
    <DetailLayout lang={lang} {...regulationsMeta(lang)}>
      <Regulations lang={lang} />
    </DetailLayout>
  );
}
