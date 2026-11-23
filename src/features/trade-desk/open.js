// Opens the HMV Trade Desk (TradeDeskHost, mounted once in SiteShell) from any page or CTA, without sharing state. `product`: a product id to preselect; `source`: a slug for analytics (where it was opened). `destination` and `volume` ({ amount, unit }): answers the opener already asked (the Quick RFQ), used with a `product`: the conversation starts at the next question. Never sent to analytics.
export const OPEN_TRADE_DESK = 'open-hmv-trade-desk';

/** @param {{ product?: string, source?: string, destination?: string, volume?: { amount: string, unit: string } }} [detail] */
export const openTradeDesk = (detail = {}) => window.dispatchEvent(new CustomEvent(OPEN_TRADE_DESK, { detail }));
