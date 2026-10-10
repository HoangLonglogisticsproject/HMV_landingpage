import { Section } from '@/components/common/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Icon } from '@/components/common/Icon';
import { LazyImage } from '@/components/common/LazyImage';
import { features } from '@/data/site';
import { cn } from '@/lib/utils';

/** Một ô tính năng: icon tròn + tiêu đề + mô tả. */
function FeatureCard({ icon, title, text, className }) {
  return (
    <div className={cn('self-center justify-self-center text-[15px] lg:w-[70%]', className)}>
      <div className="bg-brand-soft mb-[20px] flex size-[55px] items-center justify-center rounded-full">
        <Icon name={icon} className="fill-brand" />
      </div>
      <h5 className="mb-[10px] text-[20px]">{title}</h5>
      <p className="text-ink-muted">{text}</p>
    </div>
  );
}

export function Features() {
  return (
    <Section id="section--1">
      <SectionTitle
        description="Features"
        title="Everything you need in a modern bank and more."
      />

      <div className="grid gap-[40px] lg:mx-[120px] lg:grid-cols-2">
        {features.map(feature => {
          const image = (
            <LazyImage
              key={`${feature.id}-img`}
              src={feature.image.src}
              placeholder={feature.image.placeholder}
              alt={feature.image.alt}
            />
          );
          const card = <FeatureCard key={`${feature.id}-card`} {...feature} />;

          return feature.imageFirst ? [image, card] : [card, image];
        })}
      </div>
    </Section>
  );
}
