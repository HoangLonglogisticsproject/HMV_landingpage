// Takes the buyer to the Quick RFQ (the one mounted on the page) from any call to action, without sharing state, as
// openTradeDesk() does for the desk: QuickRfq listens, scrolls itself into view if it is not already, and focuses
// the buyer's place in it (the first question, the contact step, or the received state). Nothing moves on page load.
export const FOCUS_QUICK_RFQ = 'focus-hmv-quick-rfq';

export const focusQuickRfq = () => window.dispatchEvent(new CustomEvent(FOCUS_QUICK_RFQ));
