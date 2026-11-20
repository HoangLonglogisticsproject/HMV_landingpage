import { readBodyLimited } from './body';

// The HTTP side of the inquiry endpoints (app/api/inquiry, app/api/route-assessment): a same-origin JSON POST (no CORS
// headers, and a JSON body needs a CORS preflight) → the endpoint's inquiry service (service.js).
// 201 { reference } | 400 { error: 'invalid', fields } | 409 key reused for another request | 413 | 415 | 502 delivery
// failed | 503 no delivery configured.
const MAX_BODY_BYTES = 20_000;
const STATUS = { invalid: 400, conflict: 409, unavailable: 503, failed: 502 };

/**
 * @param {Request} request
 * @param {(body: unknown) => Promise<{ status: string, reference?: string, errors?: string[] }>} submit
 */
export async function inquiryResponse(request, submit) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ error: 'unsupported_media_type' }, { status: 415 });
  }
  const text = await readBodyLimited(request, MAX_BODY_BYTES);
  if (text === null) return Response.json({ error: 'too_large' }, { status: 413 });
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: 'invalid', fields: ['body'] }, { status: 400 });
  }
  const result = await submit(body);
  if (result.status === 'accepted') return Response.json({ reference: result.reference }, { status: 201 });
  const fields = result.status === 'invalid' ? result.errors : undefined;
  return Response.json({ error: result.status, fields }, { status: STATUS[result.status] });
}
