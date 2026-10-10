import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Section } from '@/components/common/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Icon } from '@/components/common/Icon';
import { operations } from '@/data/site';
import { cn } from '@/lib/utils';

/** Tabbed component: state thay cho việc thêm/bớt class active bằng tay. */
export function Operations() {
  const [activeId, setActiveId] = useState(operations[0].id);
  const active = operations.find(op => op.id === activeId);

  return (
    <Section id="section--2">
      <SectionTitle
        description="Operations"
        title="Everything as simple as possible, but no simpler."
      />

      <div className="mx-auto mt-[120px] max-w-[1000px] bg-white shadow-[0_18px_45px_-25px_rgba(0,29,89,0.35)]">
        <div className="flex flex-wrap justify-center">
          {operations.map(op => (
            <Button
              key={op.id}
              variant="tab"
              size="pill"
              onClick={() => setActiveId(op.id)}
              aria-pressed={op.id === activeId}
              className={cn(
                'mr-[25px] transition-all duration-300 last:mr-0',
                op.id === activeId ? '-translate-y-[66%]' : '-translate-y-1/2'
              )}
            >
              <span
                className={cn(
                  'mr-[10px] inline-block font-semibold',
                  op.id === activeId ? 'text-cyan' : 'text-core-blue/70'
                )}
              >
                {op.number}
              </span>
              {op.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-x-[30px] gap-y-[5px] px-[30px] pt-[25px] pb-[65px] text-[17px] lg:grid-cols-[70px_1fr] lg:px-[70px]">
          <div
            className={cn(
              'flex size-[70px] items-center justify-center rounded-full',
              active.iconClassName
            )}
          >
            <Icon name={active.icon} className="size-[27.5px] fill-inherit" />
          </div>
          <h5 className="self-center text-[22.5px] font-medium">{active.title}</h5>
          <p className="text-ink-muted lg:col-start-2">{active.text}</p>
        </div>
      </div>
    </Section>
  );
}
