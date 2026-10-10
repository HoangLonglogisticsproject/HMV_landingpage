import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSlider } from '@/hooks/useSlider';
import { cn } from '@/lib/utils';

/** Nút tròn trái/phải của slider. */
function SliderButton({ side, onClick }) {
  const Chevron = side === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous slide' : 'Next slide'}
      className={cn(
        'absolute top-1/2 z-10 flex size-[55px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/70 text-deep-blue transition-colors hover:bg-white',
        side === 'left' ? 'left-[6%] -translate-x-1/2' : 'right-[6%] translate-x-1/2'
      )}
    >
      <Chevron className="size-8" />
    </button>
  );
}

/** Chấm tròn chỉ vị trí slide hiện tại. */
function SliderDots({ count, current, onSelect }) {
  return (
    <div className="absolute bottom-[5%] left-1/2 flex -translate-x-1/2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === current}
          className={cn(
            'mr-[17.5px] size-[10px] cursor-pointer rounded-full transition-all duration-500 last:mr-0',
            i === current ? 'bg-brand opacity-100' : 'bg-ink-muted/40 opacity-70'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Slider dùng chung: nhận danh sách item và hàm render từng slide.
 * Mọi slide xếp chồng tuyệt đối rồi trượt bằng translateX.
 */
export function Slider({ items, renderItem, className, slideClassName }) {
  const { curSlide, goToSlide, nextSlide, prevSlide } = useSlider(items.length);

  return (
    <div className={cn('relative mx-auto h-[500px] max-w-[1000px] overflow-hidden', className)}>
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className={cn(
            'absolute top-0 flex h-[500px] w-full items-center justify-center transition-transform duration-1000',
            slideClassName
          )}
          style={{ transform: `translateX(${100 * (i - curSlide)}%)` }}
          aria-hidden={i !== curSlide}
        >
          {renderItem(item, i)}
        </div>
      ))}

      <SliderButton side="left" onClick={prevSlide} />
      <SliderButton side="right" onClick={nextSlide} />
      <SliderDots count={items.length} current={curSlide} onSelect={goToSlide} />
    </div>
  );
}
