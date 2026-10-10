import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Highlight } from '@/components/common/Highlight';
import { Navigation } from '@/components/sections/Navigation';
import { scrollToSection } from '@/lib/scroll';

/** Hero: nav + tiêu đề lớn + ảnh, chiếm trọn chiều cao màn hình. */
export const Header = forwardRef(function Header({ isSticky }, ref) {
  return (
    <header ref={ref} className="flex h-screen flex-col items-center px-[30px]">
      <Navigation isSticky={isSticky} />

      <div className="grid max-w-[1150px] flex-1 content-center justify-center justify-items-start gap-y-[30px] lg:grid-cols-[3fr_2fr] lg:items-start">
        <h1 className="text-[40px] leading-[1.35] lg:text-[55px]">
          When <Highlight>HMV Global</Highlight> Connect
          <br />
          <Highlight>The World</Highlight>
        </h1>

        <h4 className="text-[24px] font-medium">
          A simpler Trading experience for a simpler life.
        </h4>

        <Button variant="text" size="text" onClick={() => scrollToSection('#section--1')}>
          Learn more &DownArrow;
        </Button>

        <img
          src="/img/hero.png"
          alt="Minimalist bank items"
          className="w-full lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:-translate-y-[60px]"
        />
      </div>
    </header>
  );
});
