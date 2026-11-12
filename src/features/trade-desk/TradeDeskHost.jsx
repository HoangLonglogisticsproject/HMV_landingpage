'use client';
import { Component, Suspense, lazy, useEffect, useState } from 'react';
import { products } from '@/data/hmv';
import { track } from '@/lib/analytics';
import { OPEN_TRADE_DESK } from './open';
import { rememberVisit } from './visit';

// The HMV Trade Desk's always-loaded part (SiteShell): listens for openTradeDesk() and loads the desk itself on the
// first call, so its code (steps, rules, validation, dialog) is not in every page's initial JavaScript. Each call is
// counted in analytics here and becomes a new `request` the desk reacts to; the first one is kept while the code
// loads, so no open is lost. If the code cannot load (a new deployment, a network error), the page stays usable and
// the buyer can retry.

// A new lazy component per attempt: React.lazy keeps a failed import's rejection, so a retry needs a new import().
const loadDesk = () => lazy(() => import('./TradeDesk').then(m => ({ default: m.TradeDesk })));

const TEXT = {
  en: { loading: 'Opening HMV Trade Desk…', failed: 'HMV Trade Desk could not be opened.', retry: 'Try again', close: 'Close' },
  vi: { loading: 'Đang mở HMV Trade Desk…', failed: 'Chưa mở được HMV Trade Desk.', retry: 'Thử lại', close: 'Đóng' },
};

/** Shows `fallback` instead of its children when they throw (the desk's code failed to load). */
class LoadBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** @param {{ lang: 'en' | 'vi' }} props */
export function TradeDeskHost({ lang }) {
  const [request, setRequest] = useState(null);
  const [desk, setDesk] = useState(() => ({ Desk: loadDesk(), attempt: 0 }));
  useEffect(() => {
    rememberVisit();
    const onOpen = event => {
      const { product, source = 'unknown' } = event.detail ?? {};
      // Only a real product id reaches analytics; anything else opens the desk without one.
      const known = products.some(p => p.id === product) ? product : undefined;
      setRequest({ ...event.detail });
      track('trade_desk_open', { source, product: known, locale: lang });
      if (known) track('trade_product_selected', { product: known, source: 'preselected' });
    };
    window.addEventListener(OPEN_TRADE_DESK, onOpen);
    return () => window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  }, [lang]);
  if (!request) return null;

  const t = TEXT[lang];
  const retry = () => setDesk(d => ({ Desk: loadDesk(), attempt: d.attempt + 1 }));
  const failed = (
    <div className="desk-overlay desk-loading" role="alert">
      <div className="desk-load-failed">
        <p>{t.failed}</p>
        <button type="button" className="text-link" onClick={retry}>{t.retry}</button>
        <button type="button" className="text-link" onClick={() => setRequest(null)}>{t.close}</button>
      </div>
    </div>
  );
  const { Desk, attempt } = desk;
  return (
    <LoadBoundary key={attempt} fallback={failed}>
      <Suspense fallback={<div className="desk-overlay desk-loading" role="status">{t.loading}</div>}>
        <Desk lang={lang} request={request} />
      </Suspense>
    </LoadBoundary>
  );
}
