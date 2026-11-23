'use client';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { focusQuickRfq } from '@/features/inquiries/focus';
import { track } from '@/lib/analytics';

// A quiet way back to the Quick RFQ on a phone: a button at the bottom edge once the buyer has scrolled past the form
// (it is at the top of the page), gone while the form is in view and from the closing call to action on, which says the
// same. One IntersectionObserver, no popup, no layout of its own (fixed), the form is never remounted: the buyer returns
// to what they typed. Shown from the single-column layout (≤ 900 px) only; absent from the HTML until then (`hidden`).
const MEANINGFULLY_VISIBLE = 0.15;

export function StickySupplyCta({ lang }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const form = document.getElementById('initiate-trade');
    const end = document.querySelector('[data-final-cta]');
    if (!form || !end) return undefined;
    const at = { formInView: false, formAbove: false, endReached: false };
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === form) {
          at.formInView = entry.intersectionRatio >= MEANINGFULLY_VISIBLE;
          at.formAbove = entry.boundingClientRect.top < 0;
        } else {
          at.endReached = entry.isIntersecting || entry.boundingClientRect.top < 0;
        }
      }
      setShown(at.formAbove && !at.formInView && !at.endReached);
    }, { threshold: [0, MEANINGFULLY_VISIBLE] });
    io.observe(form);
    io.observe(end);
    return () => io.disconnect();
  }, []);

  return (
    <div
      hidden={!shown}
      data-sticky-supply-cta
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] min-[901px]:hidden motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3"
    >
      <Button type="button" size="lg" className="day-cta pointer-events-auto w-full max-w-[420px] justify-center" onClick={() => { track('home_supply_plan_click', { source: 'sticky', locale: lang }); focusQuickRfq(); }}>
        {lang === 'vi' ? 'Nhận phương án cung ứng' : 'Get Supply Proposal'}
        <ArrowRight size={18} />
      </Button>
    </div>
  );
}
