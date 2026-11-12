import { createHmac } from 'node:crypto';

// Delivery adapters: where an accepted inquiry goes. One interface, `deliver(record, inquiry)` (the labelled record and
// the validated inquiry it came from), resolving when the destination has accepted it and throwing otherwise. An
// adapter that issues the reference (the CMS) resolves with `{ reference }`, which the buyer is shown instead of the
// local one. The Trade Desk UI and the inquiry service do not know which adapter is used.

/** HTTPS webhook (automation platform, CRM endpoint or email relay): the record as JSON, signed with HMAC-SHA256. */
export function webhookAdapter({ url, secret, fetchImpl = fetch, timeoutMs = 8000 }) {
  return {
    name: 'webhook',
    async deliver(record) {
      const body = JSON.stringify(record);
      const headers = { 'content-type': 'application/json', 'idempotency-key': record.reference };
      if (secret) headers['x-hmv-signature'] = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
      const res = await fetchImpl(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(timeoutMs) });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    },
  };
}

const CMS_REFERENCE = /^HMV-\d{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/;
/** Minimum length of the website ↔ CMS shared secret (the CMS refuses to start with a shorter one). */
export const CMS_SECRET_MIN_LENGTH = 32;

/** X-HMV-Signature for the CMS: hex HMAC-SHA256 of "<timestamp>.<idempotency key>" (docs/inbound/TRADE_DESK_DELIVERY.md). */
export const signCmsRequest = (secret, timestamp, idempotencyKey) =>
  createHmac('sha256', secret).update(`${timestamp}.${idempotencyKey}`).digest('hex');

const given = value => value || undefined;

/** The CMS ingestion body (IngestTradeInquiryDto): controlled ids rather than labels; empty fields left out. */
export function cmsPayload(inquiry, consentAt) {
  const { context, contact } = inquiry;
  const utm = Object.fromEntries(Object.entries(context.utm).filter(([, v]) => v));
  return {
    locale: inquiry.locale,
    goal: inquiry.goal,
    productId: given(inquiry.product),
    goods: given(inquiry.goods),
    origin: given(inquiry.origin),
    destination: given(inquiry.destination),
    volume: inquiry.volume.amount ? inquiry.volume : undefined,
    application: given(inquiry.application),
    transport: given(inquiry.transport),
    requirements: inquiry.requirements,
    notes: given(inquiry.notes),
    contact: { company: contact.company, email: contact.email, name: given(contact.name), phone: given(contact.phone) },
    source: {
      landingPage: given(context.landingPage || context.page),
      referrer: given(context.referrer),
      utm: Object.keys(utm).length ? utm : undefined,
    },
    consentAt,
  };
}

/**
 * The HMV CMS (system of record): POST to its ingestion endpoint, server to server, signed with the shared secret.
 * The idempotency key is the Trade Desk's per-submission key, so a retry of the same submission gets the inquiry the
 * CMS already has (200) instead of a second one. 201 and 200 both carry the CMS reference.
 */
export function cmsAdapter({ url, secret, fetchImpl = fetch, timeoutMs = 8000, now = Date.now }) {
  return {
    name: 'cms',
    async deliver(record, inquiry) {
      const key = inquiry.idempotencyKey;
      const timestamp = String(Math.floor(now() / 1000));
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'idempotency-key': key,
          'x-hmv-timestamp': timestamp,
          'x-hmv-signature': signCmsRequest(secret, timestamp, key),
        },
        body: JSON.stringify(cmsPayload(inquiry, record.createdAt)),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const body = await res.json().catch(() => ({}));
      // The status and the CMS error code only: never the request body.
      if (res.status !== 201 && res.status !== 200) throw new Error(`CMS responded ${res.status} ${body.code ?? ''}`.trim());
      if (!CMS_REFERENCE.test(body.reference)) throw new Error('CMS response has no reference');
      return { reference: body.reference };
    },
  };
}

/** Keeps records in memory: tests, and local development through the `log` setting. */
export function memoryAdapter() {
  const records = [];
  return { name: 'memory', records, async deliver(record) { records.push(record); } };
}

/**
 * The adapter configured by environment, or null when none is (the API then answers 503 and no inquiry is lost
 * silently). INQUIRY_DELIVERY=cms with CMS_INQUIRY_URL (https; plain http only to this machine, for local testing)
 * and a CMS_INQUIRY_SECRET of 32+ characters; INQUIRY_DELIVERY=webhook with an https INQUIRY_WEBHOOK_URL (and
 * INQUIRY_WEBHOOK_SECRET to sign); INQUIRY_DELIVERY=log outside production keeps inquiries in memory and logs only
 * their reference. Server-side variables only: none of them may be NEXT_PUBLIC_*.
 * @param {Record<string, string | undefined>} env
 */
export function deliveryAdapterFromEnv(env) {
  if (env.INQUIRY_DELIVERY === 'cms') {
    const url = env.CMS_INQUIRY_URL ?? '';
    const secure = /^https:\/\//.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
    if (!secure || (env.CMS_INQUIRY_SECRET ?? '').length < CMS_SECRET_MIN_LENGTH) return null;
    return cmsAdapter({ url, secret: env.CMS_INQUIRY_SECRET });
  }
  if (env.INQUIRY_DELIVERY === 'webhook' && /^https:\/\//.test(env.INQUIRY_WEBHOOK_URL ?? '')) {
    return webhookAdapter({ url: env.INQUIRY_WEBHOOK_URL, secret: env.INQUIRY_WEBHOOK_SECRET });
  }
  if (env.INQUIRY_DELIVERY === 'log' && env.NODE_ENV !== 'production') {
    const memory = memoryAdapter();
    return {
      ...memory,
      name: 'log',
      async deliver(record) {
        await memory.deliver(record);
        console.info(`inquiry ${record.reference} accepted (log adapter, not delivered)`);
      },
    };
  }
  return null;
}
