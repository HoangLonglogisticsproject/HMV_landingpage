/* global process -- NEXT_PUBLIC_* references are replaced with their values at build time */
// Inquiry port `@/lib/inquiry`, Next.js implementation (tsconfig.json `paths`): the HMV Trade Desk posts the inquiry
// to the app's own endpoint (app/api/inquiry/route.ts) and gets back { status, body }.

/**
 * Public follow-up channels shown after a sent inquiry (src/features/trade-desk/channels.js); unset ones are hidden.
 * Inlined at build time. Contact handles only: the CMS address and secret are server-only and never NEXT_PUBLIC_*.
 */
export const contactChannels = {
  whatsapp: process.env.NEXT_PUBLIC_HMV_WHATSAPP,
  zalo: process.env.NEXT_PUBLIC_HMV_ZALO_URL,
  email: process.env.NEXT_PUBLIC_HMV_SALES_EMAIL,
};
export async function sendInquiry(inquiry) {
  const res = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(inquiry),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
