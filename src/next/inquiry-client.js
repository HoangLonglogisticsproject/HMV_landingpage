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

/** The browser's wait for /api/inquiry: above the server's own 8 s CMS timeout, so a slow but working delivery fits. */
export const SEND_TIMEOUT_MS = 15_000;

/**
 * POST the inquiry; rejects (AbortError) when no answer arrives within `timeoutMs`, so the Trade Desk can offer a
 * retry and the email draft instead of waiting forever.
 */
export async function sendInquiry(inquiry, { timeoutMs = SEND_TIMEOUT_MS, fetchImpl = fetch } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl('/api/inquiry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(inquiry),
      signal: controller.signal,
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  } finally {
    clearTimeout(timer);
  }
}
