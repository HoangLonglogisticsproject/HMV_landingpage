import { createHmac } from 'node:crypto';

// Delivery adapters: where an accepted inquiry record goes. One interface, `deliver(record)`, resolving when the
// destination has accepted it and throwing otherwise; the Trade Desk UI and the inquiry service do not know which one
// is used. A CRM (e.g. HubSpot) or an email provider is another adapter with the same interface.

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

/** Keeps records in memory: tests, and local development through the `log` setting. */
export function memoryAdapter() {
  const records = [];
  return { name: 'memory', records, async deliver(record) { records.push(record); } };
}

/**
 * The adapter configured by environment, or null when none is (the API then answers 503 and no inquiry is lost
 * silently). INQUIRY_DELIVERY=webhook with an https INQUIRY_WEBHOOK_URL (and INQUIRY_WEBHOOK_SECRET to sign);
 * INQUIRY_DELIVERY=log outside production keeps inquiries in memory and logs only their reference.
 * @param {Record<string, string | undefined>} env
 */
export function deliveryAdapterFromEnv(env) {
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
