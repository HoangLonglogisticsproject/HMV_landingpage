// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { contactChannels, sendInquiry } from '@/lib/inquiry';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { TradeDeskHost } from './TradeDeskHost.jsx';
import { openTradeDesk } from './open.js';

// The inquiry port is the only I/O: each test decides what the API answers.
// contactChannels: what NEXT_PUBLIC_HMV_* configure on the site; a test may clear them.
vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
// The email draft fallback: recorded, and a hash link so jsdom does not try to navigate.
vi.mock('@/features/inquiries/inquiry', () => ({ createInquiryMailto: vi.fn(() => '#email-draft') }));
const CHANNELS = { whatsapp: '+84 909 000 000', zalo: 'https://zalo.me/0909000000', email: 'sales@hmv.example' };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container;
const dialog = () => document.querySelector('[role="dialog"]');
const field = key => dialog().querySelector(`[id$="-${key}"]`);
const button = text => [...dialog().querySelectorAll('button')].find(b => b.textContent.includes(text));
const click = el => act(async () => el.click());
const setValue = (el, value, event) => act(async () => {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, value);
  el.dispatchEvent(new Event(event, { bubbles: true }));
});
const type = (el, value) => setValue(el, value, 'input');
/** The buyer answers HMV's question: types into the conversation's field and sends it. */
const say = async (key, value) => {
  await type(field(key), value);
  await click(field(key).form.querySelector('.desk-send'));
};
/** The conversation as "HMV: …" and "You: …" lines (a buyer line says "Bạn" in Vietnamese). */
const thread = () => [...dialog().querySelectorAll('.desk-msg')].map(m => `${m.querySelector('.desk-msg-from').textContent}: ${[...m.querySelectorAll('p')].map(p => p.textContent).join(' ')}`);
const panel = () => dialog().querySelector('.desk-panel').textContent;
/** Focus is on `el` (a failure names the focused element: printing DOM nodes would exhaust memory). */
const assertFocus = el => assert.ok(el && document.activeElement === el, `focus is on ${document.activeElement?.outerHTML.slice(0, 120)}`);
const assertAbsent = el => assert.ok(!el, `unexpected ${el?.outerHTML?.slice(0, 120)}`);
const events = () => (window.dataLayer ?? []).map(e => e.event);
const errors = () => [...dialog().querySelectorAll('.desk-error')].map(e => e.textContent);
// Technical questions the desk must never ask or list as missing.
const TECHNICAL = /moisture|starch %|brix|incoterm|packaging|certification|\bFOB\b|\bCIF\b|destination port|delivery window|transport|application|độ ẩm|đóng gói|chứng nhận/i;

// Through the host, as on the site: the desk's code loads on the first open.
async function render(lang = 'en') {
  await act(async () => root.render(h(TradeDeskHost, { lang })));
}
const tick = () => act(async () => new Promise(resolve => setTimeout(resolve, 10)));
/** Opens the desk and waits, inside act, until it is on screen: the first open loads the desk's module. */
const open = async detail => {
  await act(async () => openTradeDesk(detail));
  for (let i = 0; i < 300 && !dialog(); i++) await tick();
  assert.ok(dialog());
};

/** From a product page to a ready requirement and its quotation card, the contact filled in. */
async function toContact(contact = { company: 'Example Foods B.V.', email: 'buyer@example.com' }, { consent = true } = {}) {
  await open({ product: 'passion-fruit', source: 'product_hero' });
  await say('destination', 'Rotterdam, Netherlands');
  await say('volume', '2');
  await click(button('Request Quotation'));
  if (contact.company) await type(field('contact.company'), contact.company);
  if (contact.email) await type(field('contact.email'), contact.email);
  if (consent) await click(field('consent.contact'));
}
const send = () => click(button('Send Request'));

// The desk's module, transformed once up front: a cold first open on a busy machine could outlast a test's timeout,
// and every later test would fail with it.
beforeAll(() => import('./TradeDesk.jsx'));
beforeEach(async () => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  sendInquiry.mockReset();
  createInquiryMailto.mockClear();
  Object.assign(contactChannels, CHANNELS);
  delete window.dataLayer;
  sessionStorage.clear();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

test('global entry: HMV asks for the product first; no steps, no questionnaire, no contact fields', async () => {
  await render('en');
  assertAbsent(dialog());
  await open({ source: 'home_hero' });
  assert.equal(dialog().querySelector('h2').textContent, 'HMV Trade Desk');
  assert.ok(dialog().textContent.includes('B2B Agricultural Supply Desk'));
  // The real HMV Global logo, from the site's assets.
  assert.match(dialog().querySelector('img.desk-logo').getAttribute('src'), /logohmv/);
  assert.equal(dialog().querySelector('img.desk-logo').alt, 'HMV Global');
  assert.deepEqual(thread(), ['HMV: What product are you looking for?']);
  assertFocus(field('product'));
  assert.deepEqual(
    [...dialog().querySelectorAll('.desk-choice')].map(b => b.textContent),
    ['Passion fruit', 'Dried cassava chips', 'Cavendish bananas', 'Dragon fruit', 'Spices', 'Cashew nuts', 'Tapioca starch'],
  );
  // No step indicator, no requirement form, no contact field before a route is chosen.
  assert.doesNotMatch(dialog().textContent, /Step|\d \/ 4|Complete requirements|still needs|Supply plan/i);
  assert.doesNotMatch(dialog().textContent, TECHNICAL);
  assertAbsent(field('contact.company'));
  assertAbsent(field('contact.email'));
  // The requirement panel: three rows, nothing known yet; not ready.
  assert.deepEqual([...dialog().querySelectorAll('.desk-summary dt')].map(d => d.textContent), ['Product', 'Destination', 'Volume']);
  assert.equal(dialog().querySelectorAll('.desk-summary .desk-pending').length, 3);
  assert.ok(panel().includes('Exploring requirement'));
  assert.ok(panel().includes('Next: HMV Customer Service'));
  assert.deepEqual(window.dataLayer, [{ event: 'trade_desk_open', source: 'home_hero', locale: 'en' }]);
});

test('product page entry: the product is known, so HMV starts with the destination', async () => {
  await render('en');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
  assert.doesNotMatch(dialog().textContent, /What product are you looking for/);
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Dried cassava chips'));
  assertFocus(field('destination'));
  assert.ok(button("I'm still exploring"));
  assert.deepEqual(window.dataLayer, [
    { event: 'trade_desk_open', source: 'product_hero', product: 'dried-cassava-chips', locale: 'en' },
    { event: 'trade_product_selected', product: 'dried-cassava-chips', source: 'preselected' },
  ]);
});

test('RFQ path: each answer is a buyer message, the conversation stays, and three answers are ready for quotation', async () => {
  await render('en');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await say('destination', 'Chennai, India');
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?', 'You: Chennai, India', 'HMV: What volume are you planning to purchase?']);
  assertFocus(field('volume'));
  // Cassava chips: MT / month is offered first.
  assert.equal(field('volume').form.querySelector('select').value, 'mt_month');
  await say('volume', '2,000');
  assert.deepEqual(thread(), [
    'HMV: Where would you like the goods delivered?',
    'You: Chennai, India',
    'HMV: What volume are you planning to purchase?',
    'You: 2,000 MT / month',
    'HMV: Thank you. I have enough information to open a commercial inquiry for this requirement. HMV can now review the supply requirement and continue directly with our Sales team for quotation.',
  ]);
  // Ready: no further question, the quotation request is next and focused.
  assertFocus(button('Request Quotation'));
  assertAbsent(button("I'm still exploring"));
  assertAbsent(field('contact.company'));
  assert.doesNotMatch(dialog().textContent, TECHNICAL);
  assert.ok(panel().includes('Chennai, India'));
  assert.ok(panel().includes('2,000 MT / month'));
  assert.ok(panel().includes('Ready for quotation'));
  assert.ok(panel().includes('Next: HMV Sales'));

  await click(button('Request Quotation'));
  assert.equal(dialog().querySelector('.desk-contact h3').textContent, 'Request a quotation');
  assertFocus(field('contact.company'));
  // The conversation is still there above the card.
  assert.equal(thread().length, 5);
  assert.deepEqual(window.dataLayer.slice(2), [
    { event: 'trade_destination_completed', product: 'dried-cassava-chips' },
    { event: 'trade_volume_completed', product: 'dried-cassava-chips' },
    { event: 'trade_route_rfq', product: 'dried-cassava-chips' },
    { event: 'trade_contact_start', product: 'dried-cassava-chips', route: 'rfq' },
  ]);
  // Analytics never carry what the buyer typed.
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /Chennai|2,000|2000/);
});

test('global entry: a typed product is recognized; an unclear one is answered with the HMV products to choose from', async () => {
  await render('en');
  await open({ source: 'home_hero' });
  await say('product', 'rice');
  assert.deepEqual(thread(), ['HMV: What product are you looking for?', 'You: rice', 'HMV: Which HMV product is closest to your requirement?']);
  assertAbsent(field('destination'));
  await click(button('Passion fruit'));
  assert.deepEqual(thread().slice(3), ['You: Passion fruit', 'HMV: Where would you like the goods delivered?']);
  assertFocus(field('destination'));
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Passion fruit'));
  assert.deepEqual(window.dataLayer.at(-1), { event: 'trade_product_selected', product: 'passion-fruit', source: 'chosen' });
});

test('a typed sentence naming a product: shown as the buyer wrote it, and sent as the inquiry notes', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-TYPED2' } });
  await render('en');
  await open({ source: 'home_hero' });
  await say('product', 'We need dried cassava chips for our plant in India');
  assert.deepEqual(thread().slice(1), ['You: We need dried cassava chips for our plant in India', 'HMV: Where would you like the goods delivered?']);
  await say('destination', 'Chennai');
  await say('volume', '500');
  await click(button('Request Quotation'));
  await type(field('contact.company'), 'Feed Co');
  await type(field('contact.email'), 'buyer@example.com');
  await click(field('consent.contact'));
  await send();
  const [inquiry] = sendInquiry.mock.calls[0];
  assert.equal(inquiry.product, 'dried-cassava-chips');
  assert.equal(inquiry.notes, 'We need dried cassava chips for our plant in India');
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /plant in India/);
});

test('discovery: a buyer still exploring is not asked to invent a destination or volume', async () => {
  await render('en');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await click(button("I'm still exploring"));
  assert.deepEqual(thread(), [
    'HMV: Where would you like the goods delivered?',
    "You: I'm still exploring",
    'HMV: No problem. HMV Customer Service can help clarify your requirement and connect you with the appropriate commercial team.',
  ]);
  // No volume question, no destination field: the route is the next step.
  assertAbsent(field('destination'));
  assertAbsent(field('volume'));
  assertFocus(button('Discuss with HMV'));
  assert.ok(panel().includes('Exploring requirement'));
  await click(button('Discuss with HMV'));
  assert.equal(dialog().querySelector('.desk-contact h3').textContent, 'Talk to HMV Customer Service');
  assert.deepEqual(window.dataLayer.slice(-2), [
    { event: 'trade_route_discovery', product: 'dried-cassava-chips' },
    { event: 'trade_contact_start', product: 'dried-cassava-chips', route: 'discovery' },
  ]);
});

test('an amount the inquiry would refuse is pointed out in the conversation, and the error goes once corrected', async () => {
  await render('en');
  await open({ product: 'passion-fruit', source: 'product_hero' });
  await say('destination', 'Rotterdam');
  await say('volume', 'lots');
  assert.deepEqual(errors(), ['Enter a number, for example 2 or 5000.']);
  assert.equal(field('volume').getAttribute('aria-invalid'), 'true');
  assert.equal(document.getElementById(field('volume').getAttribute('aria-describedby')).textContent, 'Enter a number, for example 2 or 5000.');
  assert.equal(thread().length, 3);
  await type(field('volume'), '20');
  assert.deepEqual(errors(), []);
  assert.equal(field('volume').hasAttribute('aria-invalid'), false);
  // A unit other than the product's usual one.
  await setValue(field('volume').form.querySelector('select'), 'containers_month', 'change');
  await click(field('volume').form.querySelector('.desk-send'));
  assert.equal(thread()[3], 'You: 20 containers / month');
});

test('Vietnamese: the site language is the starting language', async () => {
  await render('vi');
  await open({ source: 'home_hero' });
  assert.deepEqual(thread(), ['HMV: Anh/chị đang tìm sản phẩm nào?']);
  const text = dialog().textContent;
  for (const s of ['Trợ lý giao thương & cung ứng nông sản', 'THÔNG TIN YÊU CẦU'.toLowerCase(), 'Chanh dây', 'Đang làm rõ nhu cầu', 'Tiếp theo: Customer Service HMV']) {
    assert.ok(text.toLowerCase().includes(s.toLowerCase()), s);
  }
  assert.equal(dialog().getAttribute('lang'), 'vi');
});

test('language: a Vietnamese sentence continues the conversation in Vietnamese', async () => {
  await render('en');
  await open({ source: 'home_hero' });
  await say('product', 'Bên tôi đang tìm sắn lát giao về Đồng Nai');
  assert.deepEqual(thread(), [
    'HMV: Anh/chị đang tìm sản phẩm nào?',
    'Bạn: Bên tôi đang tìm sắn lát giao về Đồng Nai',
    'HMV: Anh/chị cần giao hàng đến đâu?',
  ]);
  assert.equal(dialog().getAttribute('lang'), 'vi');
  assert.equal(dialog().querySelector('[aria-pressed="true"]').textContent, 'VI');
  await say('destination', 'Đồng Nai');
  await say('volume', '500');
  assert.ok(thread().at(-1).startsWith('HMV: Cảm ơn anh/chị. HMV đã có đủ thông tin cơ bản'));
  assert.ok(button('Yêu cầu báo giá'));
  assert.ok(panel().includes('Sẵn sàng chuyển báo giá'));
  assert.ok(panel().includes('Tiếp theo: HMV Sales'));
});

test('language: an English sentence continues in English on a Vietnamese site', async () => {
  await render('vi');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  assert.deepEqual(thread(), ['HMV: Anh/chị cần giao hàng đến đâu?']);
  await say('destination', 'Delivery to our plant in Chennai, India');
  assert.deepEqual(thread().slice(1), ['You: Delivery to our plant in Chennai, India', 'HMV: What volume are you planning to purchase?']);
});

test('language: a place name or a number alone never changes it', async () => {
  await render('vi');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await say('destination', 'India');
  assert.equal(thread().at(-1), 'HMV: Anh/chị dự kiến mua với sản lượng bao nhiêu?');
  await say('volume', '500');
  assert.ok(thread().at(-1).startsWith('HMV: Cảm ơn anh/chị'));
  await act(async () => root.unmount());
  root = createRoot(container);
  await render('en');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await say('destination', 'Hanoi');
  assert.equal(thread().at(-1), 'HMV: What volume are you planning to purchase?');
  await say('volume', '2000');
  assert.ok(thread().at(-1).startsWith('HMV: Thank you.'));
});

test('language: the buyer’s own choice wins over what they write until they change it', async () => {
  await render('en');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  button('VI').focus();
  await click(button('VI'));
  assert.deepEqual(thread(), ['HMV: Anh/chị cần giao hàng đến đâu?']);
  // Choosing a language never moves the buyer's focus.
  assertFocus(button('VI'));
  await say('destination', 'We need delivery to our plant in Chennai');
  assert.equal(thread().at(-1), 'HMV: Anh/chị dự kiến mua với sản lượng bao nhiêu?');
  await click(button('EN'));
  assert.deepEqual(thread(), [
    'HMV: Where would you like the goods delivered?',
    'You: We need delivery to our plant in Chennai',
    'HMV: What volume are you planning to purchase?',
  ]);
  assert.equal(button('EN').getAttribute('aria-pressed'), 'true');
  assert.equal(button('VI').getAttribute('aria-pressed'), 'false');
});

test('keyboard: focus moves into the desk on open; Escape and the close button close it', async () => {
  await render();
  await open({ source: 'home_hero' });
  assert.ok(dialog().contains(document.activeElement));
  assert.equal(dialog().querySelector('[role="log"]').getAttribute('aria-label'), 'Conversation with HMV');
  // Every conversation control has a label and sends as a form (Enter submits).
  assert.equal(dialog().querySelector(`label[for="${field('product').id}"]`).textContent, 'Product');
  assert.equal(field('product').form.querySelector('.desk-send').type, 'submit');
  await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assertAbsent(dialog());
  await open({ source: 'home_hero' });
  await click(dialog().querySelector('button[aria-label="Close"]'));
  assertAbsent(dialog());
});

test('contact last: company, business email and consent are required; name and phone optional', async () => {
  await render();
  await toContact({ company: '', email: 'not-an-email' });
  await send();
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Enter your company name.', 'Enter a valid business email.']);
  assertFocus(field('contact.company'));
  const input = name => field(`contact.${name}`);
  // In card order, with their types, autocomplete, limits and required flags.
  assert.deepEqual(
    [...dialog().querySelectorAll('.desk-contact-grid input')].map(i => i.id.split('-contact.')[1]),
    ['company', 'name', 'email', 'phone'],
  );
  assert.deepEqual(
    ['company', 'email', 'name', 'phone'].map(n => [input(n).type, input(n).getAttribute('autocomplete'), input(n).maxLength, input(n).required]),
    [['text', 'organization', 150, true], ['email', 'email', 254, true], ['text', 'name', 100, false], ['tel', 'tel', 40, false]],
  );
});

test('a corrected contact field loses its error at once; other errors stay; nothing appears on untouched fields', async () => {
  await render();
  await toContact({ company: '', email: 'not-an-email' }, { consent: false });
  await send();
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Enter your company name.', 'Enter a valid business email.', 'Confirm that HMV may contact you.']);

  // Still invalid: the error stays.
  await type(field('contact.email'), 'buyer..name@example.com');
  assert.equal(field('contact.email').getAttribute('aria-invalid'), 'true');
  // Corrected: its error, aria-invalid and aria-describedby go; the company and consent errors stay.
  await type(field('contact.email'), 'buyer@example.com');
  assert.deepEqual(errors(), ['Enter your company name.', 'Confirm that HMV may contact you.']);
  assert.equal(field('contact.email').hasAttribute('aria-invalid'), false);
  assert.equal(field('contact.email').hasAttribute('aria-describedby'), false);
  assert.equal(field('contact.company').getAttribute('aria-invalid'), 'true');
  // A field without an error gets none while typing, even an invalid value.
  await type(field('contact.phone'), 'call me');
  assert.equal(field('contact.phone').hasAttribute('aria-invalid'), false);
  // Consent given: its error goes too.
  await click(field('consent.contact'));
  assert.deepEqual(errors(), ['Enter your company name.']);
  assert.equal(sendInquiry.mock.calls.length, 0);

  // The next send still checks everything: the phone typed above is now an error.
  await type(field('contact.company'), 'Feed Co');
  assert.deepEqual(errors(), []);
  await send();
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Use digits, spaces and + ( ) - only.']);
  assertFocus(field('contact.phone'));
});

test('consent is required: without it nothing is sent and the checkbox is pointed out', async () => {
  await render();
  await toContact(undefined, { consent: false });
  await send();
  assert.equal(sendInquiry.mock.calls.length, 0);
  assert.deepEqual(errors(), ['Confirm that HMV may contact you.']);
  assertFocus(field('consent.contact'));
});

test('RFQ accepted: one request even on a double click, the reference and the commercial process, generate_lead after acceptance', async () => {
  let accept;
  sendInquiry.mockReturnValue(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  const submit = button('Send Request');
  await click(submit);
  await click(submit);
  assert.equal(sendInquiry.mock.calls.length, 1);
  assert.equal(button('Sending').disabled, true);
  assert.equal(events().includes('generate_lead'), false);

  const [inquiry] = sendInquiry.mock.calls[0];
  assert.equal(inquiry.product, 'passion-fruit');
  assert.equal(inquiry.destination, 'Rotterdam, Netherlands');
  assert.deepEqual(inquiry.volume, { amount: '2', unit: 'containers' });
  // Nothing fabricated for the fields the desk does not ask.
  assert.deepEqual([inquiry.application, inquiry.transport, inquiry.requirements, inquiry.notes], ['', '', {}, '']);
  assert.deepEqual(inquiry.contact, { company: 'Example Foods B.V.', email: 'buyer@example.com', name: '', phone: '' });
  assert.deepEqual(inquiry.consent, { contact: true });
  assert.equal(inquiry.website, '');
  assert.match(inquiry.idempotencyKey, /^[A-Za-z0-9-]{8,64}$/);

  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-7KQ4XM' } }));
  const sent = dialog().querySelector('.desk-sent');
  assert.equal(sent.querySelector('h3').textContent, 'Commercial inquiry received');
  assertFocus(sent.querySelector('h3'));
  assert.equal(sent.querySelector('.desk-reference-id').textContent, 'HMV-2026-7KQ4XM');
  assert.ok(sent.textContent.includes('HMV Sales will review your requirement and continue the quotation process with you.'));
  // The expected process, with only the request reached: no later stage is claimed.
  const stages = [...sent.querySelectorAll('.desk-timeline li')];
  assert.deepEqual(stages.map(li => li.textContent), ['Request received', 'Quotation', 'Commercial discussion', 'Sales contract', 'Supply execution']);
  assert.deepEqual(stages.map(li => li.getAttribute('aria-current')), ['step', null, null, null, null]);
  assert.doesNotMatch(sent.textContent, /quotation (is )?(ready|prepared)|in progress/i);
  assert.deepEqual(window.dataLayer.at(-1), { event: 'generate_lead', product: 'passion-fruit', locale: 'en', route: 'rfq' });
  // Nothing personal or free-text in analytics.
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /buyer@example\.com|Example Foods|Rotterdam/);

  // Optional follow-up: English order is WhatsApp, then email; links carry the reference and product only.
  const links = [...dialog().querySelectorAll('.desk-follow-up a')];
  assert.deepEqual(links.map(a => a.textContent), ['Message HMV on WhatsApp', 'Email HMV']);
  assert.equal(decodeURIComponent(links[0].href), 'https://wa.me/84909000000?text=Hello HMV, I submitted inquiry HMV-2026-7KQ4XM regarding Passion fruit.');
  for (const a of links) assert.doesNotMatch(decodeURIComponent(a.href), /buyer@example\.com|Example Foods|Rotterdam/);
});

test('discovery accepted: the destination given and the volume left open; Customer Service continues, no quotation claimed', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-EXPLOR' } });
  await render();
  await open({ product: 'bananas', source: 'product_hero' });
  await say('destination', 'Dubai');
  await click(button("I'm still exploring"));
  assert.deepEqual(thread().slice(-2), ["You: I'm still exploring", 'HMV: No problem. HMV Customer Service can help clarify your requirement and connect you with the appropriate commercial team.']);
  await click(button('Discuss with HMV'));
  await type(field('contact.company'), 'Gulf Fresh LLC');
  await type(field('contact.email'), 'Buyer@Gulf.example');
  await click(field('consent.contact'));
  await send();
  const [inquiry] = sendInquiry.mock.calls[0];
  assert.equal(inquiry.destination, 'Dubai');
  assert.equal(inquiry.volume.amount, '');
  const sent = dialog().querySelector('.desk-sent');
  assert.equal(sent.querySelector('h3').textContent, 'Inquiry received');
  assert.ok(sent.textContent.includes('HMV-2026-EXPLOR'));
  assert.ok(sent.textContent.includes('HMV Customer Service will continue the conversation and help clarify the requirement.'));
  assertAbsent(sent.querySelector('.desk-timeline'));
  assert.doesNotMatch(sent.textContent, /Quotation/);
  assert.deepEqual(window.dataLayer.at(-1), { event: 'generate_lead', product: 'bananas', locale: 'en', route: 'discovery' });
});

test('the honeypot is kept: hidden from people and sent as is, for the server to discard', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-HONEY2' } });
  await render();
  await toContact();
  const trap = dialog().querySelector('.desk-hp');
  assert.equal(trap.getAttribute('aria-hidden'), 'true');
  assert.equal(trap.tabIndex, -1);
  await type(trap, 'http://spam.example');
  await send();
  assert.equal(sendInquiry.mock.calls[0][0].website, 'http://spam.example');
});

test('the consent checkbox has a privacy notice link in the buyer language', async () => {
  await render('vi');
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await click(button('Tôi đang tìm hiểu'));
  await click(button('Trao đổi với HMV'));
  assert.equal(dialog().querySelector('.desk-contact h3').textContent, 'Trao đổi với Customer Service HMV');
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
  await send();
  assert.ok(dialog().textContent.includes('HMV-2026-7KQ4XM'));
  assertAbsent(dialog().querySelector('.desk-follow-up'));
});

test('failed delivery: the answers stay, an email draft is offered, no lead is counted, and a retry keeps the key', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 502, body: { error: 'failed' } });
  await render();
  await toContact();
  await send();
  assert.ok(dialog().querySelector('[role="alert"]').textContent.includes('could not be sent'));
  // Never a sent state or follow-up links before the server accepted the inquiry.
  assert.doesNotMatch(dialog().textContent, /inquiry received|HMV-\d{4}-/i);
  assertAbsent(dialog().querySelector('.desk-follow-up'));
  assert.ok(button('Prepare an email instead'));
  assert.equal(field('contact.company').value, 'Example Foods B.V.');
  assert.equal(thread().length, 5);
  assert.equal(events().includes('generate_lead'), false);
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-RETRY2' } });
  await click(button('Try again'));
  assert.ok(dialog().textContent.includes('HMV-2026-RETRY2'));
  // The retry reuses the inquiry's idempotency key, so the server can de-duplicate.
  assert.equal(sendInquiry.mock.calls[0][0].idempotencyKey, sendInquiry.mock.calls[1][0].idempotencyKey);
});

test('the email draft fallback carries the requirement: product, destination and volume', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 502, body: { error: 'failed' } });
  await render('en');
  await toContact();
  await send();
  await click(button('VI'));
  await click(button('Soạn email thay thế'));
  const [draft] = createInquiryMailto.mock.calls[0];
  // In English for the commercial team, whatever the desk language.
  assert.deepEqual(
    { product: draft.product, destination: draft.destination, volume: draft.volume, company: draft.company, email: draft.email },
    { product: 'Passion fruit', destination: 'Rotterdam, Netherlands', volume: '2 containers', company: 'Example Foods B.V.', email: 'buyer@example.com' },
  );
});

test('a request that times out restores the controls and offers the retry and the email draft, answers kept', async () => {
  sendInquiry.mockRejectedValueOnce(new DOMException('The operation was aborted.', 'AbortError'));
  await render();
  await toContact();
  await send();
  assert.ok(dialog().querySelector('.desk-failed').textContent.includes('could not be sent'));
  assert.equal(button('Try again').disabled, false);
  assert.equal(field('contact.company').value, 'Example Foods B.V.');
  assert.ok(button('Prepare an email instead'));
});

test('an exact retry keeps the idempotency key; an edited contact gets a new one', async () => {
  sendInquiry.mockResolvedValue({ status: 502, body: { error: 'failed' } });
  await render();
  await toContact();
  await send();
  await click(button('Try again'));
  await type(field('contact.company'), 'Example Foods Ltd');
  await click(button('Try again'));
  const keys = sendInquiry.mock.calls.map(([inquiry]) => inquiry.idempotencyKey);
  assert.equal(keys.length, 3);
  assert.equal(keys[1], keys[0]);
  assert.notEqual(keys[2], keys[1]);
});

test('a 409 (the key was used for other content) drops the submission identity: the retry takes a new key', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 409, body: { error: 'conflict' } });
  await render();
  await toContact();
  await send();
  assert.ok(dialog().querySelector('.desk-failed').textContent.includes('could not be sent'));
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-NEWKEY' } });
  await click(button('Try again'));
  const [first, second] = sendInquiry.mock.calls.map(([inquiry]) => inquiry.idempotencyKey);
  assert.notEqual(second, first);
  assert.ok(dialog().textContent.includes('HMV-2026-NEWKEY'));
});

test('a contact field the server refuses is shown at that field; anything else is a failed send', async () => {
  await render();
  await toContact();
  sendInquiry.mockResolvedValueOnce({ status: 400, body: { error: 'invalid', fields: ['contact.email'] } });
  await send();
  assertFocus(field('contact.email'));
  assert.deepEqual(errors(), ['Enter a valid business email.']);
  assertAbsent(dialog().querySelector('.desk-failed'));
  sendInquiry.mockResolvedValueOnce({ status: 400, body: { error: 'invalid', fields: ['destination'] } });
  await send();
  assert.ok(dialog().querySelector('.desk-failed'));
});

test('an acceptance that arrives while the desk is closed is shown on the next open; a new inquiry only on request', async () => {
  let accept;
  sendInquiry.mockReturnValueOnce(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  await send();
  await click(dialog().querySelector('button[aria-label="Close"]'));
  assertAbsent(dialog());
  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-CLOSED' } }));
  // Reopened, even from another product's call to action: the acceptance, not a new conversation.
  await open({ product: 'bananas', source: 'product_hero' });
  assert.ok(dialog().textContent.includes('HMV-2026-CLOSED'));
  await click(button('Start a new inquiry'));
  assert.doesNotMatch(dialog().textContent, /HMV-2026-CLOSED/);
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Cavendish bananas'));
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
});

test('once the buyer has seen the acceptance, the next open starts a new conversation', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-SEEN22' } });
  await render();
  await toContact();
  await send();
  assert.ok(dialog().textContent.includes('HMV-2026-SEEN22'));
  await click(button('Close'));
  await open({ source: 'home_hero' });
  assert.doesNotMatch(dialog().textContent, /HMV-2026-SEEN22/);
  assert.deepEqual(thread(), ['HMV: What product are you looking for?']);
});

test('reopening for the same conversation keeps it; another product starts a new one', async () => {
  await render();
  await open({ product: 'passion-fruit', source: 'product_hero' });
  await say('destination', 'Rotterdam');
  const close = () => click(dialog().querySelector('button[aria-label="Close"]'));
  await close();
  await open({ source: 'home_hero' });
  assert.equal(thread()[1], 'You: Rotterdam');
  await close();
  await open({ product: 'dragon-fruit', source: 'product_hero' });
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Dragon fruit'));
});

test('a response for an earlier conversation never changes the current one', async () => {
  let accept;
  sendInquiry.mockReturnValueOnce(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  await send();
  // Before the answer arrives, the buyer opens the desk for another product: a new conversation.
  await open({ product: 'dried-cassava-chips', source: 'product_hero' });
  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-OLDONE' } }));
  assert.doesNotMatch(dialog().textContent, /HMV-2026-OLDONE|inquiry received/i);
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Dried cassava chips'));
  // The earlier inquiry was accepted: its lead is counted, for its own product and route.
  assert.deepEqual(window.dataLayer.filter(e => e.event === 'generate_lead'), [{ event: 'generate_lead', product: 'passion-fruit', locale: 'en', route: 'rfq' }]);
});

test('while an inquiry is being sent its controls are locked; the acceptance is shown when it arrives', async () => {
  let accept;
  sendInquiry.mockReturnValueOnce(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  await send();
  // Disabled through the locked fieldset (`:disabled` is the effective state; the property is only the attribute).
  assert.equal(field('contact.company').matches(':disabled'), true);
  assert.equal(field('consent.contact').matches(':disabled'), true);
  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-LOCKED' } }));
  assert.ok(dialog().textContent.includes('HMV-2026-LOCKED'));
});

test('a new inquiry after a sent one asks for consent again and does not reuse the contact', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-FIRST1' } });
  await render();
  await toContact();
  await send();
  await click(button('Start a new inquiry'));
  await click(button("I'm still exploring"));
  await click(button('Discuss with HMV'));
  assert.equal(field('contact.company').value, '');
  assert.equal(field('contact.email').value, '');
  assert.equal(field('consent.contact').checked, false);
});

// Correcting an answer from the requirement panel.
const editButtons = () => [...dialog().querySelectorAll('.desk-edit')].map(b => b.textContent);
const summaryValue = label => [...dialog().querySelectorAll('.desk-summary > div')].find(d => d.querySelector('dt').textContent === label).querySelector('dd').firstChild.textContent;
/** From a product page to a ready requirement. */
async function ready(product = 'dried-cassava-chips', destination = 'Channai, India', amount = '2,000') {
  await open({ product, source: 'product_hero' });
  await say('destination', destination);
  await say('volume', amount);
}

test('edit destination: only the destination is asked again; product and volume stay; ready again without a second volume question', async () => {
  await render();
  await ready();
  assert.deepEqual(editButtons(), ['Edit Product', 'Edit Destination', 'Edit Volume']);
  const edit = button('Edit Destination');
  assert.equal(edit.type, 'button');
  edit.focus();
  await click(edit);
  // The conversation rewinds to the question being corrected; the panel keeps the other answers, no stale value.
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
  assertFocus(field('destination'));
  assert.equal(summaryValue('Product'), 'Dried cassava chips');
  assert.equal(summaryValue('Destination'), 'Not specified yet');
  assert.equal(summaryValue('Volume'), '2,000 MT / month');
  assert.ok(panel().includes('Exploring requirement'));
  assert.doesNotMatch(panel(), /Channai/);
  await say('destination', 'Chennai, India');
  // Volume was kept: no second volume question, straight back to ready.
  assertAbsent(field('volume'));
  assert.deepEqual(thread(), [
    'HMV: Where would you like the goods delivered?',
    'You: Chennai, India',
    'HMV: What volume are you planning to purchase?',
    'You: 2,000 MT / month',
    'HMV: Thank you. I have enough information to open a commercial inquiry for this requirement. HMV can now review the supply requirement and continue directly with our Sales team for quotation.',
  ]);
  assert.ok(panel().includes('Ready for quotation'));
  assertFocus(button('Request Quotation'));
});

test('edit volume: product and destination stay, the volume question comes back with its unit, and the route is recomputed', async () => {
  await render();
  await ready();
  await click(button('Edit Volume'));
  assertFocus(field('volume'));
  assert.equal(summaryValue('Volume'), 'Not specified yet');
  assert.equal(summaryValue('Destination'), 'Channai, India');
  assert.equal(thread().at(-1), 'HMV: What volume are you planning to purchase?');
  assert.equal(field('volume').form.querySelector('select').value, 'mt_month');
  assert.ok(panel().includes('Exploring requirement'));
  await say('volume', '3,000');
  assert.equal(summaryValue('Volume'), '3,000 MT / month');
  assert.ok(panel().includes('Ready for quotation'));
  assertFocus(button('Request Quotation'));
});

test('edit product (even from a product page): the destination stays, the volume is cleared and its unit follows the new product', async () => {
  await render();
  await ready();
  await click(button('Edit Product'));
  assertFocus(field('product'));
  assert.deepEqual(thread(), ['HMV: What product are you looking for?']);
  assert.equal(summaryValue('Product'), 'Not specified yet');
  assert.equal(summaryValue('Destination'), 'Channai, India');
  assert.equal(summaryValue('Volume'), 'Not specified yet');
  await click(button('Passion fruit'));
  assert.deepEqual(thread(), [
    'HMV: What product are you looking for?',
    'You: Passion fruit',
    'HMV: Where would you like the goods delivered?',
    'You: Channai, India',
    'HMV: What volume are you planning to purchase?',
  ]);
  assertFocus(field('volume'));
  // Containers for passion fruit: the cassava MT / month amount is not carried over.
  assert.equal(field('volume').form.querySelector('select').value, 'containers');
  assert.equal(field('volume').value, '');
  await say('volume', '2');
  assert.equal(summaryValue('Volume'), '2 containers');
  assert.ok(panel().includes('Ready for quotation'));
});

test('editing after the contact card opened closes it; the typed contact details are kept for when it reopens', async () => {
  await render();
  await toContact({ company: 'Example Foods B.V.', email: 'buyer@example.com' });
  await type(field('contact.phone'), '+31 10 000 0000');
  await click(button('Edit Destination'));
  assertAbsent(field('contact.company'));
  assertAbsent(button('Request Quotation'));
  await say('destination', 'Antwerp, Belgium');
  await click(button('Request Quotation'));
  assert.equal(field('contact.company').value, 'Example Foods B.V.');
  assert.equal(field('contact.email').value, 'buyer@example.com');
  assert.equal(field('contact.phone').value, '+31 10 000 0000');
  assert.equal(field('consent.contact').checked, true);
  // The card's start is counted once per conversation.
  assert.equal(events().filter(e => e === 'trade_contact_start').length, 1);
});

test('a buyer who was exploring corrects the destination: the remaining question is asked and the route returns to RFQ', async () => {
  await render();
  await open({ product: 'bananas', source: 'product_hero' });
  await say('destination', 'Dubia');
  await click(button('still exploring'));
  assert.ok(panel().includes('Exploring requirement'));
  assert.ok(button('Discuss with HMV'));
  await click(button('Edit Destination'));
  await say('destination', 'Dubai, UAE');
  // Exploring is set aside by the correction: the volume is asked, and the buyer may still say they are exploring.
  assertFocus(field('volume'));
  assert.ok(button('still exploring'));
  await say('volume', '4');
  assert.ok(panel().includes('Ready for quotation'));
  assert.ok(panel().includes('Next: HMV Sales'));
  assert.ok(button('Request Quotation'));
});

test('a corrected inquiry gets a new idempotency key; the same answer again is the same inquiry and keeps it', async () => {
  sendInquiry.mockResolvedValue({ status: 502, body: { error: 'failed' } });
  await render();
  await toContact();
  await send();
  assert.ok(dialog().querySelector('.desk-failed'));
  // Corrected to the same value: the very same inquiry, so the same key.
  await click(button('Edit Destination'));
  await say('destination', 'Rotterdam, Netherlands');
  await click(button('Request Quotation'));
  // The failure belonged to the earlier attempt: the card starts clean.
  assertAbsent(dialog().querySelector('.desk-failed'));
  await send();
  await click(button('Edit Destination'));
  await say('destination', 'Antwerp, Belgium');
  await click(button('Request Quotation'));
  await send();
  const sent = sendInquiry.mock.calls.map(([inquiry]) => [inquiry.destination, inquiry.idempotencyKey]);
  assert.deepEqual(sent.map(([d]) => d), ['Rotterdam, Netherlands', 'Rotterdam, Netherlands', 'Antwerp, Belgium']);
  assert.equal(sent[1][1], sent[0][1]);
  assert.notEqual(sent[2][1], sent[1][1]);
});

test('no edit while an inquiry is being sent, and none once it was accepted', async () => {
  let accept;
  sendInquiry.mockReturnValueOnce(new Promise(resolve => { accept = resolve; }));
  await render();
  await toContact();
  await send();
  assert.ok([...dialog().querySelectorAll('.desk-edit')].every(b => b.disabled));
  await act(async () => accept({ status: 201, body: { reference: 'HMV-2026-FIXED1' } }));
  assert.ok(dialog().textContent.includes('HMV-2026-FIXED1'));
  assert.deepEqual(editButtons(), []);
  assert.equal(summaryValue('Destination'), 'Rotterdam, Netherlands');
});

test('Vietnamese: the edit action is "Sửa"', async () => {
  await render('vi');
  await ready();
  assert.deepEqual(editButtons(), ['Sửa Sản phẩm', 'Sửa Điểm đến', 'Sửa Sản lượng']);
});

test('a new conversation while the desk is open: no unsent draft carries over, and its question has focus', async () => {
  await render();
  await open({ product: 'passion-fruit', source: 'product_hero' });
  await type(field('destination'), 'Rotterdam (not sent)');
  // Opened for another product before the destination was sent: the same question, in a new conversation.
  await open({ product: 'bananas', source: 'product_hero' });
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('Cavendish bananas'));
  assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
  assert.equal(field('destination').value, '');
  assertFocus(field('destination'));
  // An edit in the new conversation still focuses its question.
  await say('destination', 'Dubai');
  await say('volume', '4');
  await click(button('Edit Volume'));
  assertFocus(field('volume'));
  assert.equal(field('volume').value, '');
});
