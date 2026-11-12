// Inquiry port `@/lib/inquiry`, Vite implementation (alias in vite.config.js). The Vite site has no server, so there is
// no endpoint to post to: the HMV Trade Desk shows its "could not be sent" state with the email-draft fallback.
// MIGRATION-ONLY: delete at cleanup with the rest of the Vite layer.
export const contactChannels = {};

export async function sendInquiry() {
  return { status: 503, body: { error: 'unavailable' } };
}
