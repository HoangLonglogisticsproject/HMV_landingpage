import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getJourneyChapters, journeyExtras, journeyStage } from '@/lib/journey';
import type { Locale } from '@/lib/i18n';
import landscape from '@/assets/agri-landscape.jpg';

const WorldScene = lazy(() => import('./WorldScene'));

export function WorldJourney({ locale = 'en' }: { locale?: Locale }) {
  const journeyChapters = getJourneyChapters(locale);
  const x = journeyExtras[locale];
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [stage, setStage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setMounted(true);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(motion.matches);
    const el = section.current;
    if (!el) return;
    const update = () => {
      const bounds = el.getBoundingClientRect();
      const travel = Math.max(1, bounds.height - window.innerHeight + 88);
      progress.current = Math.max(0, Math.min(1, (88 - bounds.top) / travel));
      setStage(journeyStage(progress.current));
    };
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)));
    observer.observe(el);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return <section ref={section} className="world-journey" aria-label={x.aria}>
    <div className="world-stage bg-secondary">
      <img src={landscape} width={1920} height={1024} alt={x.alt} fetchPriority="high" className={`world-fallback ${ready ? 'world-fallback-hidden' : ''}`} />
      {mounted && <Suspense fallback={null}><WorldScene progress={progress} reduced={reduced} visible={visible} onReady={() => setReady(true)} /></Suspense>}
      <div className="world-copy page-width">
        <div className="world-chapters" aria-live="polite">{journeyChapters.map((chapter, i) => <div key={chapter.id} className={`world-chapter ${stage === i ? 'is-active' : ''}`} aria-hidden={stage !== i} inert={stage !== i}>
          <p className="eyebrow mb-5 flex items-center gap-3 text-primary"><span className="h-px w-8 bg-primary" /> {chapter.label}</p>
          {i === 0 ? <h1 className="world-title">{chapter.title}<span>{chapter.accent}</span></h1> : <h2 className="world-title">{chapter.title}<span>{chapter.accent}</span></h2>}
          <p className="world-description mt-6 text-sm leading-7 text-muted-foreground">{chapter.description}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">{i === 5 && <p className="w-full font-display text-lg font-semibold text-primary">{x.build}</p>}<Button asChild className="h-12 px-5"><a href={chapter.href}>{chapter.cta}<ArrowUpRight /></a></Button>{i === 5 && <Button asChild variant="outline" className="h-12 px-5"><a href="#commodities">{x.explore}</a></Button>}{(i === 0 || i === 5) && <a href="#blueprint" className="inline-flex items-center gap-2 text-xs font-semibold text-ocean-deep">{x.partner} <ArrowUpRight className="size-4" /></a>}</div>
        </div>)}</div>
      </div>
      <div className="world-caption text-primary"><span className="eyebrow">{journeyChapters[stage]?.caption}</span><span className="mt-2 block text-[10px] text-muted-foreground">{x.note}</span></div>
      <div className="world-bottom page-width"><div className="flex items-center gap-3 text-xs text-ocean-deep"><ArrowDown className="size-4" /><span>{x.scroll}</span></div><div className="flex items-center gap-5">{journeyChapters.map((c, i) => <span key={c.id} className={`world-step ${stage === i ? 'is-active' : ''}`}><span className="font-display">0{i + 1}</span><span className="world-step-label">{c.step}</span></span>)}</div><span className="hidden text-[10px] text-muted-foreground lg:block">AGRICULTURAL TRADE. CONNECTED.</span></div>
    </div>
  </section>;
}