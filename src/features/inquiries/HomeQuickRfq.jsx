'use client';
import { QuickRfq } from './QuickRfq';
import { quickRfqCopy } from './quickRfqCopy';
import styles from './QuickRfq.module.css';

// The homepage's Quick RFQ (`#initiate-trade`, the target of every call to action that says "Get Supply Proposal"):
// the one QuickRfq of the page, with the page's heading at the top of its card. It sits in the hero (views/home/
// sections/CinematicHero), where the buyer sees it first.
export function HomeQuickRfq({ lang }) {
  const c = quickRfqCopy[lang];
  return (
    <section id="initiate-trade" aria-label={c.form}>
      <QuickRfq
        lang={lang}
        intro={(
          <div className="grid gap-1.5">
            <p className="text-[11px] font-semibold text-brand">{c.eyebrow}</p>
            <h2 id="rfq-title" className={`${styles.heading} font-['Plus_Jakarta_Sans'] text-[22px] leading-tight font-extrabold text-balance text-navy`}>{c.title}</h2>
            <p className="text-sm text-ink-muted max-[600px]:hidden">{c.lead}</p>
          </div>
        )}
      />
    </section>
  );
}
