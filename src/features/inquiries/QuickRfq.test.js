// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { sendInquiry } from '@/lib/inquiry';
import { OPEN_TRADE_DESK } from '@/features/trade-desk/open';
import { createInquiryMailto } from './inquiry';
import { QuickRfq } from './QuickRfq.jsx';
import { TradeRfq } from './TradeRfq.jsx';
import { quickRfqCopy } from './quickRfqCopy.js';

// The inquiry port is the only I/O: each test decides what the API answers.
vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
// The email draft fallback: recorded, and a hash link so jsdom does not try to navigate.
vi.mock('./inquiry', () => ({ createInquiryMailto: vi.fn(() => '#email-draft') }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const ACCEPTED = { status: 201, body: { reference: 'HMV-2026-ABC123' } };
let root, container;
const fields = () => container.querySelector('form.rfq-form');
const field = key => container.querySelector(`[id$="-${key}"]`);
const button = text => [...container.querySelectorAll('button')].find(b => b.textContent.includes(text));
const click = el => act(async () => el.click());
const setValue = (el, value, event) => act(async () => {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, value);
  el.dispatchEvent(new Event(event, { bubbles: true }));
});
const type = (el, value) => setValue(el, value, 'input');
const choose = (el, value) => setValue(el, value, 'change');
const errors = () => [...container.querySelectorAll('p[id$="-error"]')].map(p => p.textContent);
const events = () => (window.dataLayer ?? []).map(e => e.event);
const assertFocus = el => assert.ok(el && document.activeElement === el, `focus is on ${document.activeElement?.outerHTML.slice(0, 120)}`);

async function render(lang = 'en', props = {}) {
  await act(async () => root.render(h(TradeRfq, { lang, ...props })));
}
/** Step 1 answered and continued: the contact step is on screen. */
async function toContact({ product = 'dried-cassava-chips', destination = 'Busan, South Korea', amount = '500' } = {}) {
  await choose(field('product'), product);
  await type(field('destination'), destination);
  await type(field('volume.amount'), amount);
  await click(submit());
}
async function fillContact({ company = 'Example Foods B.V.', email = 'buyer@example.com', consent = true } = {}) {
  if (company) await type(field('contact.company'), company);
  if (email) await type(field('contact.email'), email);
  if (consent) await click(field('consent.contact'));
}
/** The step's one submit button (Continue, Send Request, Try again), in either language. */
const submit = () => container.querySelector('form button[type="submit"]');
const send = () => click(submit());
const sentInquiry = (n = 0) => sendInquiry.mock.calls[n][0];

beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  sendInquiry.mockReset();
  createInquiryMailto.mockClear();
  delete window.dataLayer;
  sessionStorage.clear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

test('step 1: the fast lane label, the three questions and one button; nothing of the contact step, no mailto flow', async () => {
  await render();
  const section = container.querySelector('section#initiate-trade');
  assert.equal(section.getAttribute('aria-labelledby'), 'rfq-title');
  assert.equal(container.querySelector('p.eyebrow').textContent, 'QUICK RFQ · FAST LANE');
  assert.equal(container.querySelector('h2#rfq-title').textContent, 'Tell us what you need');
  assert.ok(section.textContent.includes('Share the basics. HMV will review the sourcing requirement and follow up with you.'));
  assert.deepEqual([...fields().querySelectorAll('label')].map(l => l.textContent), ['Product', 'Destination', 'Estimated volume']);
  assert.ok(button('Continue'));
  // The controlled product ids, never the display labels.
  assert.deepEqual([...field('product').options].map(o => o.value), ['', 'passion-fruit', 'dried-cassava-chips', 'bananas', 'dragon-fruit', 'spices', 'nuts', 'tapioca-starch']);
  assert.equal(field('destination').placeholder, 'Busan, South Korea');
  assert.equal(field('volume.amount').inputMode, 'decimal');
  assert.equal(container.querySelectorAll('textarea').length, 0);
  assert.equal(field('contact.company'), null);
  assert.equal(field('contact.email'), null);
  assert.doesNotMatch(container.textContent, /Prepare RFQ email|email app|draft/i);
  // Loading the page moves no focus and counts nothing.
  assert.notEqual(document.activeElement, field('product'));
  assert.equal(window.dataLayer, undefined);
});

test('step 1: the volume unit starts as the product’s usual one and follows the product until the buyer chooses one', async () => {
  await render();
  const unit = () => field('volume.amount').closest('div.grid').querySelector('select');
  assert.equal(unit().value, 'containers');
  await choose(field('product'), 'dried-cassava-chips');
  assert.equal(unit().value, 'mt_month');
  assert.deepEqual([...unit().options].map(o => o.textContent), ['containers', 'containers / month', 'MT', 'MT / month']);
  await choose(field('product'), 'bananas');
  assert.equal(unit().value, 'containers');
  await choose(unit(), 'mt');
  await choose(field('product'), 'dried-cassava-chips');
  assert.equal(unit().value, 'mt');
});

test('step 1: product, destination and a numeric volume are required; the first error is focused, in words and tied to its field', async () => {
  await render();
  await click(button('Continue'));
  assert.deepEqual(errors(), ['Choose a product.', 'Enter a destination.', 'Enter a number, for example 500.']);
  assertFocus(field('product'));
  assert.equal(field('product').getAttribute('aria-invalid'), 'true');
  assert.equal(document.getElementById(field('product').getAttribute('aria-describedby')).textContent, 'Choose a product.');
  assert.equal(field('contact.company'), null);

  await choose(field('product'), 'passion-fruit');
  assert.deepEqual(errors(), ['Enter a destination.', 'Enter a number, for example 500.']);
  await type(field('destination'), 'Rotterdam, Netherlands');
  await type(field('volume.amount'), 'lots');
  await click(button('Continue'));
  assert.deepEqual(errors(), ['Enter a number, for example 500.']);
  assertFocus(field('volume.amount'));
  // Still invalid after an edit: its error stays; valid: it goes at once.
  await type(field('volume.amount'), '5x');
  assert.equal(errors().length, 1);
  await type(field('volume.amount'), '2,000');
  assert.deepEqual(errors(), []);
});

test('step 1 → step 2: the requirement is kept in one line, the step’s heading has focus and can be edited back', async () => {
  await render();
  await toContact();
  const heading = container.querySelector('h3');
  assert.equal(heading.textContent, 'Where should HMV contact you?');
  assertFocus(heading);
  assert.match(container.querySelector('[aria-current="step"]').textContent, /Contact$/);
  assert.ok(container.textContent.includes('Dried cassava chips · Busan, South Korea · 500 MT / month'));
  assert.equal(field('product'), null);

  await click(button('Edit'));
  assertFocus(field('product'));
  assert.equal(field('product').value, 'dried-cassava-chips');
  assert.equal(field('destination').value, 'Busan, South Korea');
  assert.equal(field('volume.amount').value, '500');
  await click(button('Continue'));
  assertFocus(container.querySelector('h3'));
});

test('step 2: company, work email and consent are required; name, phone and notes are optional and folded away', async () => {
  await render();
  await toContact();
  assert.deepEqual([...fields().querySelectorAll('label')].map(l => l.textContent.replace(/\s+/g, ' ').trim()), ['Company', 'Work email', 'Name optional', 'WhatsApp / phone optional', 'Additional information optional', 'HMV may contact me about this inquiry. Privacy notice']);
  const more = button('Add more details');
  assert.equal(more.getAttribute('aria-expanded'), 'false');
  assert.equal(document.getElementById(more.getAttribute('aria-controls')).hidden, true);
  assert.equal(field('consent.contact').checked, false);

  await click(button('Send Request'));
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Enter your company name.', 'Enter a valid business email.', 'Confirm that HMV may contact you.']);
  assertFocus(field('contact.company'));
  await type(field('contact.email'), 'not an email');
  assert.ok(errors().includes('Enter a valid business email.'));
  await fillContact({ company: 'Example Foods B.V.', email: 'buyer@example.com', consent: true });
  assert.deepEqual(errors(), []);

  await click(more);
  assert.equal(more.getAttribute('aria-expanded'), 'true');
  assert.equal(document.getElementById(more.getAttribute('aria-controls')).hidden, false);
  await type(field('contact.phone'), 'call me');
  await click(button('Send Request'));
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Use digits, spaces and + ( ) - only.']);
  assertFocus(field('contact.phone'));
});

test('a send goes to /api/inquiry as the Trade Desk’s inquiry: controlled product id, nothing inferred, the visit attached', async () => {
  sessionStorage.setItem('hmv_landing', '/products/dried-cassava-chips');
  sessionStorage.setItem('hmv_referrer', 'https://www.google.com/search?q=cassava');
  sessionStorage.setItem('hmv_utm', JSON.stringify({ source: 'newsletter', medium: 'email', campaign: 'spring' }));
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  await click(button('Add more details'));
  await type(field('contact.name'), 'Kim Min-jun');
  await type(field('contact.phone'), '+82 10 1234 5678');
  await type(field('notes'), 'Feed grade.');
  await send();

  assert.equal(sendInquiry.mock.calls.length, 1);
  const { idempotencyKey, ...inquiry } = sentInquiry();
  assert.match(idempotencyKey, /^[A-Za-z0-9-]{8,64}$/);
  assert.deepEqual(inquiry, {
    locale: 'en',
    product: 'dried-cassava-chips',
    destination: 'Busan, South Korea',
    volume: { amount: '500', unit: 'mt_month' },
    application: '',
    transport: '',
    requirements: {},
    notes: 'Feed grade.',
    contact: { company: 'Example Foods B.V.', email: 'buyer@example.com', name: 'Kim Min-jun', phone: '+82 10 1234 5678' },
    consent: { contact: true },
    // The visit: this page, the landing page, the referrer's origin only and the campaign.
    context: { page: '/', landingPage: '/products/dried-cassava-chips', referrer: 'https://www.google.com/search?q=cassava', utm: { source: 'newsletter', medium: 'email', campaign: 'spring' } },
    website: '',
  });
});

test('accepted: the form is replaced by the received state with the reference, no email app, generate_lead counted once', async () => {
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  const assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
  await send();

  const done = container.querySelector('section.rfq-form');
  assert.equal(container.querySelector('form'), null);
  assert.equal(done.querySelector('h3').textContent, 'Request received');
  assertFocus(done.querySelector('h3'));
  assert.ok(done.textContent.includes('Reference: HMV-2026-ABC123'));
  assert.ok(done.textContent.includes('HMV will review your requirement and contact you through the information provided.'));
  assert.ok(button('Submit another request'));
  assert.equal(createInquiryMailto.mock.calls.length, 0);
  assert.equal(assign.mock.calls.length, 0);
  assert.doesNotMatch(container.textContent, /Send by email instead|Need guidance/);
  assert.deepEqual(window.dataLayer.filter(e => e.event === 'generate_lead'), [{ event: 'generate_lead', product: 'dried-cassava-chips', locale: 'en', route: 'rfq', source: 'quick_rfq' }]);
  vi.unstubAllGlobals();

  // Another request starts from nothing: new consent, a new key.
  await click(button('Submit another request'));
  assertFocus(field('product'));
  assert.equal(field('product').value, '');
  await toContact();
  assert.equal(field('contact.company').value, '');
  assert.equal(field('consent.contact').checked, false);
});

test('the reference can be copied', async () => {
  const writeText = vi.fn().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  await send();
  await click(button('Copy reference'));
  assert.deepEqual(writeText.mock.calls, [['HMV-2026-ABC123']]);
  assert.ok(button('Copied'));
  assert.equal(container.querySelector('output').textContent, 'Copied');
  delete navigator.clipboard;
});

test('a double submit sends one request; while it is sent the fields are locked and the button says so', async () => {
  let respond;
  sendInquiry.mockReturnValue(new Promise(resolve => { respond = resolve; }));
  await render();
  await toContact();
  await fillContact();
  await act(async () => {
    fields().requestSubmit();
    fields().requestSubmit();
  });
  assert.equal(sendInquiry.mock.calls.length, 1);
  assert.equal(container.querySelector('fieldset').disabled, true);
  assert.ok(button('Sending…'));
  assert.equal(container.querySelector('output').textContent, 'Sending…');
  await act(async () => respond(ACCEPTED));
  assert.ok(container.textContent.includes('HMV-2026-ABC123'));
  assert.equal(sendInquiry.mock.calls.length, 1);
});

test('a rerender never makes a new key or another lead', async () => {
  sendInquiry.mockResolvedValue({ status: 503, body: {} });
  await render();
  await toContact();
  await fillContact();
  await send();
  await render();
  await render('vi');
  await render('en');
  assert.equal(sendInquiry.mock.calls.length, 1);
});

test('failed delivery: the details stay, nothing is claimed, "Try again" is the action and the email draft only a fallback', async () => {
  sendInquiry.mockResolvedValue({ status: 503, body: { error: 'unavailable' } });
  await render();
  assert.doesNotMatch(container.textContent, /Send by email instead/);
  await toContact();
  await fillContact();
  assert.doesNotMatch(container.textContent, /Send by email instead/);
  await send();

  const alert = container.querySelector('[role="alert"]');
  assert.equal(alert.querySelector('p').textContent, 'We could not send your request. Your details are kept here: try again, or send it by email instead.');
  assertFocus(alert);
  assert.doesNotMatch(container.textContent, /Request received|HMV-2026/);
  assert.equal(field('contact.company').value, 'Example Foods B.V.');
  assert.equal(field('contact.email').value, 'buyer@example.com');
  assert.ok(button('Try again'));
  assert.equal(window.dataLayer.filter(e => e.event === 'generate_lead').length, 0);
  assert.deepEqual(window.dataLayer.at(-1), { event: 'quick_rfq_error', product: 'dried-cassava-chips', locale: 'en', step: 'contact', reason: 'unavailable' });

  // The fallback carries the requirement, in English, as the Trade Desk's does.
  const assign = vi.fn();
  vi.stubGlobal('location', { ...window.location, assign });
  await click(button('Send by email instead'));
  assert.deepEqual(createInquiryMailto.mock.calls, [[{
    company: 'Example Foods B.V.', email: 'buyer@example.com', name: '', phone: '', product: 'Dried cassava chips', destination: 'Busan, South Korea', volume: '500 MT / month', message: '',
  }]]);
  assert.deepEqual(assign.mock.calls, [['#email-draft']]);
  vi.unstubAllGlobals();
});

test('a request that cannot be reached is a failed send too, and the retry then succeeds', async () => {
  sendInquiry.mockRejectedValueOnce(new DOMException('aborted', 'AbortError')).mockResolvedValueOnce(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  await send();
  assert.ok(container.querySelector('[role="alert"]'));
  assert.equal(window.dataLayer.at(-1).reason, 'network');
  await send();
  assert.ok(container.textContent.includes('HMV-2026-ABC123'));
  assert.equal(container.querySelector('[role="alert"]'), null);
});

test('an exact retry keeps the idempotency key; a changed inquiry takes a new one; a 409 drops it', async () => {
  sendInquiry.mockResolvedValue({ status: 502, body: {} });
  await render();
  await toContact();
  await fillContact();
  await send();
  await send();
  const [first, retry] = [sentInquiry(0), sentInquiry(1)];
  assert.equal(retry.idempotencyKey, first.idempotencyKey);
  assert.deepEqual(retry, first);

  await type(field('contact.company'), 'Example Foods Korea');
  await send();
  const changed = sentInquiry(2);
  assert.notEqual(changed.idempotencyKey, first.idempotencyKey);
  // Back to the first content is a changed inquiry again: a key stands for the last submission only.
  await send();
  assert.equal(sentInquiry(3).idempotencyKey, changed.idempotencyKey);

  sendInquiry.mockResolvedValueOnce({ status: 409, body: { error: 'conflict' } });
  await send();
  await send();
  assert.notEqual(sentInquiry(5).idempotencyKey, sentInquiry(4).idempotencyKey);
  assert.equal(window.dataLayer.find(e => e.reason === 'conflict').event, 'quick_rfq_error');
});

test('going back after a failed send clears the failure; the changed requirement is sent with a new key and the contact kept', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 502, body: {} }).mockResolvedValueOnce(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  await send();
  assert.ok(container.querySelector('[role="alert"]'));
  await click(button('Edit'));
  assert.equal(container.querySelector('[role="alert"]'), null);
  await type(field('destination'), 'Incheon, South Korea');
  await click(submit());
  assert.equal(container.querySelector('[role="alert"]'), null);
  assert.equal(field('contact.email').value, 'buyer@example.com');
  assert.equal(field('consent.contact').checked, true);
  await send();
  assert.equal(sentInquiry(1).destination, 'Incheon, South Korea');
  assert.notEqual(sentInquiry(1).idempotencyKey, sentInquiry(0).idempotencyKey);
  assert.ok(container.textContent.includes('HMV-2026-ABC123'));
});

test('a field the server refuses is shown at its field, on its step; the optional ones open', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 400, body: { error: 'invalid', fields: ['contact.phone'] } });
  await render();
  await toContact();
  await fillContact();
  await send();
  assert.equal(container.querySelector('[role="alert"]'), null);
  assert.equal(document.getElementById(button('Add more details').getAttribute('aria-controls')).hidden, false);
  assert.deepEqual(errors(), ['Use digits, spaces and + ( ) - only.']);
  assertFocus(field('contact.phone'));
  assert.ok(button('Send Request'));

  sendInquiry.mockResolvedValueOnce({ status: 400, body: { error: 'invalid', fields: ['volume.amount'] } });
  await send();
  assert.ok(field('volume.amount'));
  assert.deepEqual(errors(), ['Enter a number, for example 500.']);
  assertFocus(field('volume.amount'));
});

test('the honeypot is hidden from people and sent as is, for the server to discard', async () => {
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render();
  await toContact();
  await fillContact();
  const trap = container.querySelector('input.desk-hp');
  assert.equal(trap.getAttribute('aria-hidden'), 'true');
  assert.equal(trap.tabIndex, -1);
  await type(trap, 'https://spam.example');
  await send();
  assert.equal(sentInquiry().website, 'https://spam.example');
  // A bot filling the trap is not a buyer starting the form.
  assert.equal(events().filter(e => e === 'quick_rfq_start').length, 1);
});

test('analytics: the funnel in order, categorical values only, no contact details, destination or notes', async () => {
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render('vi');
  await toContact({ destination: 'Cảng Busan', amount: '4321' });
  await fillContact({ company: 'Công ty Ví Dụ', email: 'buyer@example.com' });
  await click(button('Thêm thông tin'));
  await type(field('contact.name'), 'Nguyễn Văn A');
  await type(field('contact.phone'), '+84 909 000 111');
  await type(field('notes'), 'Cần giá FOB');
  await send();

  assert.deepEqual(window.dataLayer, [
    { event: 'quick_rfq_start', product: 'dried-cassava-chips', locale: 'vi', step: 'requirement' },
    { event: 'quick_rfq_requirement_complete', product: 'dried-cassava-chips', locale: 'vi', step: 'requirement' },
    { event: 'quick_rfq_contact_start', product: 'dried-cassava-chips', locale: 'vi', step: 'contact' },
    { event: 'quick_rfq_submit', product: 'dried-cassava-chips', locale: 'vi', step: 'contact' },
    { event: 'quick_rfq_success', product: 'dried-cassava-chips', locale: 'vi' },
    { event: 'generate_lead', product: 'dried-cassava-chips', locale: 'vi', route: 'rfq', source: 'quick_rfq' },
  ]);
  const everything = JSON.stringify(window.dataLayer);
  for (const private_ of ['buyer@example.com', 'Ví Dụ', 'Busan', '4321', 'Nguyễn', '909', 'FOB', 'HMV-2026']) assert.ok(!everything.includes(private_), private_);
});

test('analytics: opening the form counts nothing, a lead only once the API accepted it', async () => {
  sendInquiry.mockResolvedValue({ status: 503, body: {} });
  await render();
  assert.equal(window.dataLayer, undefined);
  await toContact();
  await fillContact();
  await send();
  assert.ok(!events().includes('generate_lead'));
  assert.ok(!events().includes('quick_rfq_success'));
  assert.equal(events().filter(e => e === 'quick_rfq_submit').length, 1);
  await send();
  assert.equal(events().filter(e => e === 'quick_rfq_submit').length, 2);
  assert.equal(events().filter(e => e === 'quick_rfq_error').length, 2);
});

test('Vietnamese: every visible text of the form is Vietnamese, the inquiry carries the locale', async () => {
  sendInquiry.mockResolvedValue(ACCEPTED);
  await render('vi');
  assert.equal(container.querySelector('p.eyebrow').textContent, 'QUICK RFQ · GỬI NHANH');
  assert.equal(container.querySelector('h2#rfq-title').textContent, 'Cho HMV biết nhu cầu của bạn');
  assert.ok(container.textContent.includes('Chỉ cần cung cấp các thông tin chính. HMV sẽ xem xét nhu cầu và liên hệ lại với bạn.'));
  assert.deepEqual([...fields().querySelectorAll('label')].map(l => l.textContent), ['Sản phẩm', 'Điểm đến', 'Sản lượng dự kiến']);
  assert.equal(field('product').options[2].textContent, 'Sắn lát khô');
  await click(button('Tiếp tục'));
  assert.deepEqual(errors(), ['Chọn sản phẩm.', 'Nhập điểm đến.', 'Nhập một số, ví dụ 500.']);
  await toContact();
  assert.equal(container.querySelector('h3').textContent, 'HMV có thể liên hệ với bạn qua đâu?');
  assert.ok(container.textContent.includes('Sắn lát khô · Busan, South Korea · 500 tấn / tháng'));
  assert.ok(container.querySelector('a[href="/vi/privacy"]'));
  await fillContact();
  await send();
  assert.equal(sentInquiry().locale, 'vi');
  assert.equal(container.querySelector('section.rfq-form h3').textContent, 'HMV đã nhận yêu cầu');
  assert.ok(container.textContent.includes('Mã tham chiếu: HMV-2026-ABC123'));
  assert.ok(container.textContent.includes('HMV sẽ xem xét nhu cầu và liên hệ lại qua thông tin bạn đã cung cấp.'));
});

test('English and Vietnamese copy have the same entries, none empty', () => {
  const shape = value => (typeof value === 'string' ? value : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)])));
  const keys = value => (typeof value === 'string' ? [] : Object.entries(value).flatMap(([k, v]) => [k, ...keys(v).map(n => `${k}.${n}`)]));
  assert.deepEqual(keys(quickRfqCopy.en), keys(quickRfqCopy.vi));
  const texts = value => (typeof value === 'string' ? [value] : Object.values(value).flatMap(texts));
  assert.ok(texts(shape(quickRfqCopy.en)).every(Boolean));
  assert.ok(texts(shape(quickRfqCopy.vi)).every(Boolean));
});

test('the assisted lane: the Trade Desk opens with the product, destination and volume already given', async () => {
  const opened = [];
  const onOpen = event => opened.push(event.detail);
  window.addEventListener(OPEN_TRADE_DESK, onOpen);
  await render();
  await click(button('Open HMV Trade Desk'));
  await choose(field('product'), 'dried-cassava-chips');
  await click(button('Open HMV Trade Desk'));
  await type(field('destination'), 'Busan, South Korea');
  await type(field('volume.amount'), '500');
  await click(button('Open HMV Trade Desk'));
  await type(field('volume.amount'), 'lots');
  await click(button('Open HMV Trade Desk'));
  window.removeEventListener(OPEN_TRADE_DESK, onOpen);
  assert.deepEqual(opened, [
    { source: 'quick_rfq' },
    { source: 'quick_rfq', product: 'dried-cassava-chips' },
    { source: 'quick_rfq', product: 'dried-cassava-chips', destination: 'Busan, South Korea', volume: { amount: '500', unit: 'mt_month' } },
    { source: 'quick_rfq', product: 'dried-cassava-chips', destination: 'Busan, South Korea' },
  ]);
  assert.ok(container.textContent.includes('Need guidance?'));
  assert.ok(container.textContent.includes('Use HMV Trade Desk for sourcing, logistics or requirement support.'));
});

test('the leadership’s addresses are a quiet disclosure, closed by default, outside the form', async () => {
  await render();
  const direct = container.querySelector('details');
  assert.equal(direct.open, false);
  assert.equal(direct.querySelector('summary').textContent, 'Prefer to write to HMV directly?');
  assert.equal(direct.querySelectorAll('a[href^="mailto:"]').length, 3);
  assert.equal(fields().querySelector('a[href^="mailto:"]'), null);
});

test('a product page: the product is fixed and not asked, the buyer gives only destination and volume', async () => {
  sendInquiry.mockResolvedValue(ACCEPTED);
  await act(async () => root.render(h(QuickRfq, { lang: 'en', product: 'dried-cassava-chips', source: 'product_quick_rfq' })));
  assert.equal(field('product'), null);
  assert.ok(fields().textContent.includes('Dried cassava chips'));
  assert.deepEqual([...fields().querySelectorAll('label')].map(l => l.textContent), ['Destination', 'Estimated volume']);
  assert.equal(field('volume.amount').closest('div.grid').querySelector('select').value, 'mt_month');
  await click(button('Continue'));
  assert.deepEqual(errors(), ['Enter a destination.', 'Enter a number, for example 500.']);
  assertFocus(field('destination'));
  await type(field('destination'), 'Chennai, India');
  await type(field('volume.amount'), '2,000');
  await click(button('Continue'));
  await fillContact();
  await send();
  assert.equal(sentInquiry().product, 'dried-cassava-chips');
  assert.equal(window.dataLayer.at(-1).source, 'product_quick_rfq');
});
