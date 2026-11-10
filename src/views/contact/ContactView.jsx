import { DetailLayout } from '@/components/layout/DetailLayout';
import { Contact } from '@/features/inquiries/Contact';
import { contactMeta } from '../meta';

// Contact page body, shared by both builds.
export function ContactView({ lang }) {
  return (
    <DetailLayout lang={lang} {...contactMeta(lang)} contactCta={false}>
      <Contact lang={lang} full />
    </DetailLayout>
  );
}
