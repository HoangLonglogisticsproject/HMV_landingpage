import { test } from 'vitest';
import assert from 'node:assert/strict';
import { followUpChannels } from './channels.js';

const all = { whatsapp: '+84 909 000 000', zalo: 'https://zalo.me/0909000000', email: 'sales@hmv.example' };
const sent = { reference: 'HMV-2026-7KQ4XM', subject: 'Dried Cassava Chips' };

test('English: WhatsApp first, then email; no Zalo', () => {
  const channels = followUpChannels(all, { lang: 'en', ...sent });
  assert.deepEqual(channels.map(c => c.id), ['whatsapp', 'email']);
  assert.equal(
    channels[0].href,
    `https://wa.me/84909000000?text=${encodeURIComponent('Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Dried Cassava Chips.')}`,
  );
  assert.equal(
    channels[1].href,
    `mailto:sales@hmv.example?subject=${encodeURIComponent('HMV-2026-7KQ4XM — Dried Cassava Chips')}&body=${encodeURIComponent('Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Dried Cassava Chips.')}`,
  );
});

test('Vietnamese: Zalo first, then WhatsApp, then email', () => {
  const channels = followUpChannels(all, { lang: 'vi', reference: sent.reference, subject: 'Sắn lát khô' });
  assert.deepEqual(channels.map(c => c.id), ['zalo', 'whatsapp', 'email']);
  assert.equal(channels[0].href, 'https://zalo.me/0909000000');
  assert.match(decodeURIComponent(channels[1].href), /Xin chào HMV, tôi đã gửi yêu cầu HMV-2026-7KQ4XM về Sắn lát khô\.$/);
});

test('unset or malformed channels are left out, never rendered broken', () => {
  assert.deepEqual(followUpChannels({}, { lang: 'vi', ...sent }), []);
  const bad = { whatsapp: '0909', zalo: 'http://zalo.me/x', email: 'sales@hmv.example?bcc=x@y.z' };
  assert.deepEqual(followUpChannels(bad, { lang: 'vi', ...sent }), []);
  assert.deepEqual(followUpChannels({ zalo: 'https://example.com/zalo' }, { lang: 'vi', ...sent }), []);
  assert.deepEqual(followUpChannels({ zalo: 'https://oa.zalo.me/123' }, { lang: 'vi', ...sent }).map(c => c.id), ['zalo']);
});
