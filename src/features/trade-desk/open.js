// Opens the HMV Trade Desk (TradeDeskHost, mounted once in SiteShell) from any page or CTA, without sharing state. `product`: a product id to preselect; `source`: a slug for analytics (where it was opened).
export const OPEN_TRADE_DESK = 'open-hmv-trade-desk';

/** @param {{ product?: string, goal?: string, source?: string }} [detail] */
export const openTradeDesk = (detail = {}) => window.dispatchEvent(new CustomEvent(OPEN_TRADE_DESK, { detail }));
