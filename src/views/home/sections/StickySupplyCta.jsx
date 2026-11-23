'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { focusQuickRfq } from '@/features/inquiries/focus';
import { track } from '@/lib/analytics';

// A quiet way back to the Quick RFQ on a phone: a button at the bottom edge once the buyer has scrolled past the form
// (it is at the top of the page), gone while the form is in view and from the closing call to action on, which says the
// same. No popup, no layout of its own (fixed), and the form is never remounted: the buyer returns to what they typed.
// Shown on a phone only (≤ 600 px, the site's phone breakpoint: a tablet has the form on its first screen and room to
// scroll); closed in the HTML (`hidden`) until the browser decides.
// The position of the form is read from its geometry, at most once a frame while the page scrolls (passive listener, no
// polling): an IntersectionObserver reports only edges, so a jump past the form that never intersects it (a landscape
// phone, End, an anchor) would leave it stale.
const MEANINGFULLY_VISIBLE = 0.15;

export function StickySupplyCta({ lang }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const form = document.getElementById('initiate-trade');
    const end = document.querySelector('[data-final-cta]');
    if (!form || !end) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, bottom, height } = form.getBoundingClientRect();
      const inView = Math.min(bottom, window.innerHeight) - Math.max(top, 0) >= MEANINGFULLY_VISIBLE * height;
      const reachedEnd = end.getBoundingClientRect().top < window.innerHeight;
      setShown(top < 0 && !inView && !reachedEnd);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      hidden={!shown}
      data-sticky-supply-cta
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] min-[601px]:hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3"
    >
      <Button type="button" size="lg" className="day-cta pointer-events-auto w-full max-w-[420px] justify-center" onClick={() => { track('home_supply_plan_click', { source: 'sticky', locale: lang }); focusQuickRfq(); }}>
        {lang === 'vi' ? 'Nhận phương án cung ứng' : 'Get Supply Proposal'}
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}
