// First-touch context of the visit (landing page, external referrer, UTM): this session only, never personal data.
// Recorded on every page load by TradeDeskHost, read when the Trade Desk submits.

export function rememberVisit() {
  try {
    const store = sessionStorage;
    if (!store.getItem('hmv_landing')) {
      store.setItem('hmv_landing', location.pathname);
      store.setItem('hmv_referrer', document.referrer);
    }
    const params = new URLSearchParams(location.search);
    const utm = { source: params.get('utm_source'), medium: params.get('utm_medium'), campaign: params.get('utm_campaign') };
    if (Object.values(utm).some(Boolean)) store.setItem('hmv_utm', JSON.stringify(utm));
  } catch {
    // Storage blocked: the inquiry goes without visit context.
  }
}

export function visitContext() {
  const page = location.pathname;
  try {
    const store = sessionStorage;
    return { page, landingPage: store.getItem('hmv_landing') || page, referrer: store.getItem('hmv_referrer') || '', utm: JSON.parse(store.getItem('hmv_utm') || '{}') };
  } catch {
    return { page, landingPage: page, referrer: '', utm: {} };
  }
}
