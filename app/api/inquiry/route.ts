import { deliveryAdapterFromEnv } from '@/next/inquiry/adapters';
import { createInquiryService } from '@/next/inquiry/service';

// HMV Trade Desk inquiries: JSON body (src/features/trade-desk/brief.js toInquiry) → validation → inquiry service →
// delivery adapter (src/next/inquiry). Same-origin only: no CORS headers, and a JSON body needs a CORS preflight.
// 201 { reference } | 400 { error: 'invalid', fields } | 413 | 502 delivery failed | 503 no delivery configured.
const MAX_BODY = 20_000;
const submit = createInquiryService({ adapter: deliveryAdapterFromEnv(process.env) });
const STATUS = { invalid: 400, unavailable: 503, failed: 502 } as const;

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'unsupported_media_type' }, { status: 415 });
  }
  const text = await request.text();
  if (text.length > MAX_BODY) return Response.json({ error: 'too_large' }, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'invalid', fields: ['body'] }, { status: 400 });
  }
  const result = await submit(body);
  if (result.status === 'accepted') return Response.json({ reference: result.reference }, { status: 201 });
  const fields = result.status === 'invalid' ? result.errors : undefined;
  return Response.json({ error: result.status, fields }, { status: STATUS[result.status as keyof typeof STATUS] });
}
