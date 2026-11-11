// Inquiry port `@/lib/inquiry`, Next.js implementation (tsconfig.json `paths`): the HMV Trade Desk posts the inquiry
// to the app's own endpoint (app/api/inquiry/route.ts) and gets back { status, body }.
export async function sendInquiry(inquiry) {
  const res = await fetch('/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(inquiry),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
