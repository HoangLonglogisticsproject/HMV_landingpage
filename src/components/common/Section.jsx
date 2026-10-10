import { useRevealOnScroll } from '@/hooks/useRevealOnScroll';
import { cn } from '@/lib/utils';

/**
 * Khung chung cho mọi section: padding, viền trên và hiệu ứng
 * hiện dần khi cuộn tới.
 */
export function Section({ id, className, children }) {
  const { ref, isVisible } = useRevealOnScroll();

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'border-t border-border px-[30px] py-[100px] transition-[transform,opacity] duration-1000 lg:py-[150px]',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[80px] opacity-0',
        className
      )}
    >
      {children}
    </section>
  );
}
