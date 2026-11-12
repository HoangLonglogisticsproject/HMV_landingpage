// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { contactChannels, sendInquiry } from '@/lib/inquiry';
import { TradeDeskHost } from './TradeDeskHost.jsx';
import { openTradeDesk } from './open.js';

// The inquiry port is the only I/O: each test decides what the API answers.
// contactChannels: what NEXT_PUBLIC_HMV_* configure on the site; a test may clear them.
vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
const CHANNELS = { whatsapp: '+84 909 000 000', zalo: 'https://zalo.me/0909000000', email: 'sales@hmv.example' };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
const dialog = () => document.querySelector('[role="dialog"]');
const field = key => dialog().querySelector(`[id$="-${key}"]`);
const button = text => [...dialog().querySelectorAll('button')].find(b => b.textContent.includes(text));
const click = el => act(async () => el.click());
const type = (el, value) => act(async () => {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const events = () => (window.dataLayer ?? []).map(e => e.event);

// Through the host, as on the site: the desk's code loads on the first open.
async function render(lang = 'en') {
  await act(async () => root.render(h(TradeDeskHost, { lang })));
}
const open = async detail => {
  await act(async () => {
    openTradeDesk(detail);
    // The first open loads the desk's module: let it resolve inside act so React commits the desk.
    await import('./TradeDesk.jsx');
    await new Promise(resolve => setTimeout(resolve, 0));
  });
  assert.ok(dialog());
};

// From a product page to the preliminary brief with the contact form filled in.
async function toContact(contact = { company: 'Example Foods B.V.', email: 'buyer@example.com' }) {
  await open({ product: 'passion-fruit', source: 'product_hero' });
  await type(field('destination'), 'Rotterdam, Netherlands');
  await type(field('volume'), '2');
  await click(button('Review requirement'));
  await click(button('See preliminary brief'));
  if (contact.company) await type(field('contact.company'), contact.company);
  if (contact.email) await type(field('contact.email'), contact.email);
  await click(field('consent.contact'));
}

beforeEach(async () => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  sendInquiry.mockReset();
  Object.assign(contactChannels, CHANNELS);
  delete window.dataLayer;
  sessionStorage.clear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

test('opens from a call to action with the product preselected, in English', async () => {
  await render('en');
  assert.equal(dialog(), null);
  await open({ product: 'passion-fruit', source: 'product_hero' });
  assert.equal(dialog().querySelector('h2').textContent, 'HMV Trade Desk');
  assert.ok(dialog().textContent.includes('Trade inquiry & sourcing desk'));
  assert.equal(dialog().querySelector('input[type="radio"][value="passion-fruit"]').checked, true);
  assert.deepEqual(window.dataLayer, [
    { event: 'trade_desk_open', source: 'product_hero', product: 'passion-fruit', locale: 'en' },
    { event: 'trade_product_selected', product: 'passion-fruit', source: 'preselected' },
  ]);
  assert.doesNotMatch(dialog().textContent, /\bAI\b|assistant|chatbot|typing/i);
});

test('Vietnamese: the desk, its steps and its controls in Vietnamese', async () => {
  await render('vi');
  await open({ source: 'home_hero' });
  const text = dialog().textContent;
  for (const s of ['Tiếp nhận & chuẩn hóa yêu cầu giao thương', 'Nhu cầu', 'Phân tích yêu cầu', 'Bổ sung thông tin', 'Phương án & báo giá', 'Tìm nguồn hàng', 'Chanh dây']) {
    assert.ok(text.includes(s), s);
  }
});

test('keyboard: focus moves into the desk on open; Escape and the close button close it', async () => {
  await render();
  await open({ source: 'home_hero' });
  assert.ok(dialog().contains(document.activeElement));
  await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.equal(dialog(), null);
  await open({ source: 'home_hero' });
  await click(dialog().querySelector('button[aria-label="Close"]'));
  assert.equal(dialog(), null);
});

test('progressive requirements: product first, then the controlled list of what HMV still needs', async () => {
  await render();
  await open({ source: 'home_hero' });
  assert.equal(button('Review requirement').disabled, true);
  await click(dialog().querySelector('input[value="dried-cassava-chips"]'));
  assert.equal(button('Review requirement').disabled, false);
  await click(button('Review requirement'));
  const missing = () => [...dialog().querySelectorAll('.desk-missing button')].map(b => b.textContent);
  assert.deepEqual(missing(), ['Destination', 'Estimated volume', 'Application', 'Required starch %', 'Maximum moisture %', 'Loading / packaging requirement', 'Incoterm', 'Exact destination port', 'Delivery window']);
  // The Intertek sample appears only as a reference, with its caveat.
  assert.ok(dialog().textContent.includes('Intertek AGRIVIETNAM2026-1700'));
  assert.ok(dialog().textContent.includes('not a fixed shipment specification'));
  // A missing-information chip leads to its field; answering it removes it.
  await click(button('Required starch %'));
  assert.equal(document.activeElement, field('starch'));
  await type(field('starch'), '70');
  await click(button('Back'));
  assert.equal(missing().includes('Required starch %'), false);
  assert.ok(events().includes('trade_requirement_progress'));
});

test('preliminary brief before any contact detail: summary, next action, disclaimer and no commercial promises', async () => {
  await render();
  await open({ product: 'passion-fruit', source: 'product_hero' });
  assert.equal(dialog().querySelector('[id$="-contact.email"]'), null);
  await type(field('destination'), 'Rotterdam');
  await click(button('Review requirement'));
  await click(button('See preliminary brief'));
  const brief = dialog().querySelector('.desk-brief').textContent;
  assert.ok(brief.includes('Preliminary Supply Brief'));
  assert.ok(brief.includes('Vietnam → Rotterdam'));
  assert.ok(brief.includes('The HMV commercial team reviews this brief'));
  assert.ok(brief.includes('Availability, specifications, pricing and delivery terms are confirmed by HMV in the commercial proposal.'));
  assert.doesNotMatch(brief.replace(/Availability, specifications, pricing[^.]*\./, ''), /\$|USD|price|in stock|available|guarantee|certified|transit|\d+\s*days/i);
  assert.ok(field('contact.email'));
  // Missing: the volume and the seven passion-fruit requirements.
  assert.deepEqual(window.dataLayer.find(e => e.event === 'trade_brief_generated'), { event: 'trade_brief_generated', goal: 'sourcing', product: 'passion-fruit', missing: 8 });
});

test('contact validation: company, work email and consent are checked before anything is sent', async () => {
  await render();
  await toContact({ company: '', email: 'not-an-email' });
  await click(button('Send to HMV Commercial Team'));
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual([...dialog().querySelectorAll('.desk-error')].map(e => e.textContent), ['Enter your company name.', 'Enter a valid work email.']);
  assert.equal(document.activeElement, field('contact.company'));
});

test('successful inquiry: one request even on a double click, the reference shown, generate_lead only after acceptance', async () => {
  let accept;
  sendInquiry.mockReturnValue(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  const send = button('Send to HMV Commercial Team');
  await click(send);
  await click(send);
  assert.equal(sendInquiry.mock.calls.length, 1);
  assert.equal(button('Sending').disabled, true);
  assert.equal(events().includes('generate_lead'), false);

  const [inquiry] = sendInquiry.mock.calls[0];
  assert.equal(inquiry.product, 'passion-fruit');
  assert.equal(inquiry.destination, 'Rotterdam, Netherlands');
  assert.deepEqual(inquiry.contact, { company: 'Example Foods B.V.', email: 'buyer@example.com', name: '', phone: '' });
  assert.deepEqual(inquiry.consent, { contact: true });
  assert.match(inquiry.idempotencyKey, /^[A-Za-z0-9-]{8,64}$/);

  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-7KQ4XM' } }));
  assert.ok(dialog().textContent.includes('HMV-2026-7KQ4XM'));
  assert.deepEqual(window.dataLayer.at(-1), { event: 'generate_lead', goal: 'sourcing', product: 'passion-fruit', locale: 'en' });
  // Nothing personal or free-text in analytics.
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /buyer@example\.com|Example Foods|Rotterdam/);

  // Optional follow-up: English order is WhatsApp, then email; links carry the reference and product only.
  const links = [...dialog().querySelectorAll('.desk-follow-up a')];
  assert.deepEqual(links.map(a => a.textContent), ['Message HMV on WhatsApp', 'Email the HMV commercial team']);
  assert.equal(decodeURIComponent(links[0].href), 'https://wa.me/84909000000?text=Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Passion fruit.');
  for (const a of links) assert.doesNotMatch(decodeURIComponent(a.href), /buyer@example\.com|Example Foods|Rotterdam/);
});

test('the consent checkbox has a privacy notice link in the buyer language', async () => {
  await render('vi');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await click(button('Xem phân tích'));
  await click(button('Xem phương án sơ bộ'));
  const link = dialog().querySelector('.desk-privacy');
  assert.equal(link.textContent, 'Thông báo quyền riêng tư');
  assert.equal(link.getAttribute('href'), '/vi/privacy');
  assert.equal(link.target, '_blank');
});

test('without configured channels the sent state shows no follow-up links', async () => {
  for (const k of Object.keys(CHANNELS)) delete contactChannels[k];
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-7KQ4XM' } });
  await render();
  await toContact();
  await click(button('Send to HMV Commercial Team'));
  assert.ok(dialog().textContent.includes('HMV-2026-7KQ4XM'));
  assert.equal(dialog().querySelector('.desk-follow-up'), null);
});

test('failed delivery: the answers stay, an email draft is offered, no lead is counted, and a retry works', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 502, body: { error: 'failed' } });
  await render();
  await toContact();
  await click(button('Send to HMV Commercial Team'));
  assert.ok(dialog().querySelector('[role="alert"]').textContent.includes('could not be sent'));
  // Never a sent state or follow-up links before the server accepted the inquiry.
  assert.doesNotMatch(dialog().textContent, /Sent to the HMV commercial team|HMV-\d{4}-/);
  assert.equal(dialog().querySelector('.desk-follow-up'), null);
  assert.ok(button('Prepare an email instead'));
  assert.equal(field('contact.company').value, 'Example Foods B.V.');
  assert.equal(events().includes('generate_lead'), false);
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-RETRY2' } });
  await click(button('Try again'));
  assert.ok(dialog().textContent.includes('HMV-2026-RETRY2'));
  // The retry reuses the brief's idempotency key, so the server can de-duplicate.
  assert.equal(sendInquiry.mock.calls[0][0].idempotencyKey, sendInquiry.mock.calls[1][0].idempotencyKey);
});
