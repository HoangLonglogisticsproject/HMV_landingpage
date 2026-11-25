'use client';
import { Zap } from 'lucide-react';
import { QuickRfq } from './QuickRfq';
import { quickRfqCopy } from './quickRfqCopy';
import styles from './QuickRfq.module.css';

// The homepage's Quick RFQ (`#initiate-trade`, the target of every call to action that says "Get Supply Proposal"): the
// one QuickRfq of the page, a compact strip directly below the hero (views/home/HomeView). It belongs to the hero's
// journey but never covers its photograph: it rises over the hero's own bottom padding by a few pixels (the bottom edge
// of the hero's photograph is clear of it) so the two read as one. The hero has the assisted lane's call to action
// already, so the form's own "Need guidance?" row (which carries what was typed) appears once the buyer has started.
export function HomeQuickRfq({ lang }) {
  const c = quickRfqCopy[lang];
  return (
    <section id="initiate-trade" aria-label={c.form} className="relative z-10 -mt-8 max-[900px]:-mt-4">
      <div className="content-width">
        <QuickRfq
          lang={lang}
          strip
          guidance="started"
          intro={(
            <div className="flex items-start gap-3 min-[1240px]:gap-2.5">
              <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[rgb(16_185_129/0.12)] text-(--farm-green-ink) min-[1240px]:size-9">
                <Zap size={20} />
              </span>
              <div className="grid gap-1">
                <p className="text-[11px] font-bold text-(--farm-green-ink)">{c.eyebrow}</p>
                <h2 id="rfq-title" className={`${styles.heading} font-['Plus_Jakarta_Sans'] text-xl leading-tight font-extrabold text-balance text-navy min-[1240px]:text-lg`}>{c.title}</h2>
                <p className="text-[13px] leading-snug text-ink-muted min-[1240px]:hidden">{c.lead}</p>
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}
