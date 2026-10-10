import { Button } from '@/components/ui/button';
import { Section } from '@/components/common/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { useModal } from '@/context/ModalContext';

export function SignUp() {
  const { openModal } = useModal();

  return (
    <Section className="bg-surface-dark border-t-0 border-b border-white/10 px-[30px] py-[100px] text-center lg:py-[100px]">
      <SectionTitle
        title="The best day to join Bankist was one year ago. The second best is today!"
        className="mb-[60px]"
        headerClassName="text-center text-white"
      />

      <Button variant="cyan" size="pill-lg" onClick={openModal}>
        Open your free account today!
      </Button>
    </Section>
  );
}
