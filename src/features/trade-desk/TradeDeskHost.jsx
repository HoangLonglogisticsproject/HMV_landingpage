'use client';
import { Suspense, lazy, useEffect, useState } from 'react';
import { products } from '@/data/hmv';
import { track } from '@/lib/analytics';
import { OPEN_TRADE_DESK } from './open';
import { rememberVisit } from './visit';

// The HMV Trade Desk's always-loaded part (SiteShell): listens for openTradeDesk() and loads the desk itself on the
// first call, so its code (steps, rules, validation, dialog) is not in every page's initial JavaScript. Each call is
// counted in analytics here and becomes a new `request` the desk reacts to; the first one is kept while the code
// loads, so no open is lost.
const TradeDesk = lazy(() => import('./TradeDesk').then(m => ({ default: m.TradeDesk })));

const LOADING = { en: 'Opening HMV Trade Desk…', vi: 'Đang mở HMV Trade Desk…' };

/** @param {{ lang: 'en' | 'vi' }} props */
export function TradeDeskHost({ lang }) {
  const [request, setRequest] = useState(null);
  useEffect(() => {
    rememberVisit();
    const onOpen = event => {
      const { product, source = 'unknown' } = event.detail ?? {};
      setRequest({ ...event.detail });
      track('trade_desk_open', { source, product, locale: lang });
      if (products.some(p => p.id === product)) track('trade_product_selected', { product, source: 'preselected' });
    };
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    return () => window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  }, [lang]);
  if (!request) return null;
  return (
    <Suspense fallback={<div className="desk-overlay desk-loading" role="status">{LOADING[lang]}</div>}>
      <TradeDesk lang={lang} request={request} />
    </Suspense>
  );
}
