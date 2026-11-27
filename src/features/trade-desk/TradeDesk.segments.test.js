// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { sendInquiry } from '@/lib/inquiry';
import { TradeDeskHost } from './TradeDeskHost.jsx';
import { openTradeDesk } from './open.js';

// The buyer segment of a golden passion fruit conversation and the page it is attributed to (TradeDesk.jsx): the transitions
// between segment pages, with the desk open or closed, the history moving under it, a sent inquiry and a started one. The
// invariants, whatever the order of events:
//  1. a conversation's segment is one the product declares, else none (never an inherited or unknown name);
//  2. its segment and the page it started on are set together, from the page it starts on, never one from an earlier page;
//  3. a segment page asks its own volume question, in its own units, and a page of another segment starts a new conversation;
//  4. "a new inquiry" takes the segment of the page the buyer is on, not the last opener's;
//  5. the inquiry's source page is the segment page the conversation started on only for golden passion fruit;
//  6. any other product, or a conversation without a segment, is sent from the page the buyer is on;
//  7. language, close and reopen, and a failed send with its retry change neither the segment nor the page nor the key;
//  8. nothing is added to the inquiry: the segment is read from its page.
vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
vi.mock('@/features/inquiries/inquiry', () => ({ createInquiryMailto: vi.fn(() => '#email-draft') }));
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const EXPORT = '/products/passion-fruit';
const FOOD = '/products/passion-fruit/foodservice';
const RETAIL = '/products/passion-fruit/retail';
const FOOD_VI = '/vi/san-pham/chanh-day/khach-san-nha-hang';
const KG_UNITS = ['kg', 'kg_week', 'kg_month', 'mt', 'mt_month'];
const TRADE_UNITS = ['containers', 'containers_month', 'mt', 'mt_month'];
const EXPORT_UNITS = [...TRADE_UNITS, 'kg'];
const ASKS = {
  foodservice: 'What quantity of golden passion fruit does your hospitality or beverage business require?',
  retail: 'What quantity of golden passion fruit are you planning to distribute?',
  export: 'What quantity of golden passion fruit are you planning to import?',
  generic: 'What volume are you planning to purchase?',
};
const REFERENCE = 'HMV-2026-7KQ4XM';

let root, container;
const dialog = () => document.querySelector('[role="dialog"]');
const field = key => dialog().querySelector(`[id$="-${key}"]`);
const button = text => [...dialog().querySelectorAll('button')].find(b => b.textContent.includes(text));
const click = el => act(async () => el.click());
const type = (el, value) => act(async () => {
  Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const say = async (key, value) => {
  await type(field(key), value);
  await click(field(key).form.querySelector('.desk-send'));
};
const thread = () => [...dialog().querySelectorAll('.desk-msg')].map(m => `${m.querySelector('.desk-msg-from').textContent}: ${[...m.querySelectorAll('p')].map(p => p.textContent).join(' ')}`);
const units = () => [...field('volume').form.querySelector('select').options].map(o => o.value);
const tick = () => act(async () => new Promise(resolve => setTimeout(resolve, 10)));
const open = async detail => {
  await act(async () => openTradeDesk(detail));
  for (let i = 0; i < 300 && !dialog(); i++) await tick();
  assert.ok(dialog());
};
const closeDesk = () => click(dialog().querySelector('button[aria-label="Close"]'));
/** The browser moves to a page (a link, Back or Forward) while the desk stays where it is. */
const goTo = path => history.pushState({}, '', path);
const sent = () => sendInquiry.mock.calls.map(([inquiry]) => inquiry);
const pageOfLast = () => sent().at(-1).context.page;

/** The buyer answers the volume question and sends the requirement with a contact. */
async function finish(amount = '50') {
  await say('volume', amount);
  await click(button('Request Quotation'));
  await type(field('contact.company'), 'Resort Co');
  await type(field('contact.email'), 'buyer@example.com');
  await click(field('consent.contact'));
  await click(button('Send Request'));
}

beforeAll(() => import('./TradeDesk.jsx'));
beforeEach(async () => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  sendInquiry.mockReset();
  sendInquiry.mockResolvedValue({ status: 201, body: { reference: REFERENCE } });
  delete window.dataLayer;
  sessionStorage.clear();
  goTo('/');
  await act(async () => root.render(h(TradeDeskHost, { lang: 'en' })));
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  document.body.replaceChildren(container);
  container.remove();
});

test('a segment page asks its own question in its own units, and its inquiry is sent from that page', async () => {
  for (const [path, segment, expected] of [[EXPORT, 'export', EXPORT_UNITS], [FOOD, 'foodservice', KG_UNITS], [RETAIL, 'retail', KG_UNITS]]) {
    sendInquiry.mockClear();
    goTo(path);
    await open({ product: 'passion-fruit', segment, source: 'test' });
    await say('destination', 'Da Nang');
    assert.equal(thread().at(-1), `HMV: ${ASKS[segment]}`);
    assert.deepEqual(units(), expected);
    await finish();
    assert.equal(pageOfLast(), path);
    assert.deepEqual(Object.keys(sent()[0]).includes('segment'), false);
    // The buyer has seen the result and closes: the next open of the desk is a new conversation.
    await closeDesk();
  }
});

test('a new inquiry after a sent one takes the segment of the page the buyer is on, with the history moved under the open desk', async () => {
  goTo(RETAIL);
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  await say('destination', 'Da Nang');
  await finish('20');
  assert.equal(pageOfLast(), RETAIL);
  // Back: the page under the open desk is now the foodservice page, and the last opener's segment is retail.
  goTo(FOOD);
  await click(button('Start a new inquiry'));
  await say('destination', 'Hoi An');
  assert.equal(thread().at(-1), `HMV: ${ASKS.foodservice}`);
  assert.deepEqual(units(), KG_UNITS);
  await finish('5');
  assert.equal(pageOfLast(), FOOD);
  assert.equal(sent().at(-1).destination, 'Hoi An');
  // Forward to the retail page, then a page without a segment: each new inquiry follows the page, and the last has none.
  goTo(RETAIL);
  await click(button('Start a new inquiry'));
  await say('destination', 'Hue');
  assert.equal(thread().at(-1), `HMV: ${ASKS.retail}`);
  await finish('7');
  assert.equal(pageOfLast(), RETAIL);
  goTo('/about');
  await click(button('Start a new inquiry'));
  await say('destination', 'Can Tho');
  assert.equal(thread().at(-1), `HMV: ${ASKS.generic}`);
  assert.deepEqual(units(), TRADE_UNITS);
  await finish('2');
  assert.equal(pageOfLast(), '/about');
});

test('a new inquiry on the same page keeps that page and segment; the contact and consent start empty', async () => {
  goTo(FOOD);
  await open({ product: 'passion-fruit', segment: 'foodservice', source: 'test' });
  await say('destination', 'Da Nang');
  await finish();
  await click(button('Start a new inquiry'));
  await say('destination', 'Hue');
  assert.equal(thread().at(-1), `HMV: ${ASKS.foodservice}`);
  await say('volume', '9');
  await click(button('Request Quotation'));
  assert.equal(field('contact.company').value, '');
  assert.equal(field('consent.contact').checked, false);
  await type(field('contact.company'), 'Resort Co');
  await type(field('contact.email'), 'buyer@example.com');
  await click(field('consent.contact'));
  await click(button('Send Request'));
  assert.equal(pageOfLast(), FOOD);
  assert.equal(sent().length, 2);
});

test('another segment page starts a new conversation in its own units: foodservice to retail, retail to export, export to foodservice', async () => {
  for (const [from, to] of [[['foodservice', FOOD], ['retail', RETAIL, KG_UNITS]], [['retail', RETAIL], ['export', EXPORT, EXPORT_UNITS]], [['export', EXPORT], ['foodservice', FOOD, KG_UNITS]]]) {
    goTo(from[1]);
    await open({ product: 'passion-fruit', segment: from[0], source: 'test' });
    await say('destination', 'Da Nang');
    await closeDesk();
    goTo(to[1]);
    await open({ product: 'passion-fruit', segment: to[0], source: 'test' });
    // A new conversation: the earlier destination is not carried, the question is the page's own, nothing was sent.
    assert.deepEqual(thread(), ['HMV: Where would you like the goods delivered?']);
    await say('destination', 'Hue');
    assert.equal(thread().at(-1), `HMV: ${ASKS[to[0]]}`);
    assert.deepEqual(units(), to[2]);
    await finish();
    assert.equal(pageOfLast(), to[1]);
    assert.equal(sendInquiry.mock.calls.length, 1);
    // The buyer has seen the result and closes: the next open of the desk is a new conversation.
    await closeDesk();
    sendInquiry.mockClear();
  }
});

test('close and reopen on the same page keeps the conversation, its segment and its page, also from a page without one', async () => {
  goTo(RETAIL);
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  await say('destination', 'Da Nang');
  await closeDesk();
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  assert.equal(thread()[1], 'You: Da Nang');
  await closeDesk();
  // Opened again from the header of another page, no product, no segment: the same conversation, still the retail one.
  goTo('/about');
  await open({ source: 'header' });
  assert.equal(thread()[1], 'You: Da Nang');
  assert.equal(thread().at(-1), `HMV: ${ASKS.retail}`);
  await finish('30');
  assert.equal(pageOfLast(), RETAIL);
  assert.deepEqual(sent().at(-1).volume, { amount: '30', unit: 'kg' });
});

test('golden passion fruit changed for another product is sent from the page the buyer is on, never as a passion fruit lead', async () => {
  goTo(RETAIL);
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  await say('destination', 'Da Nang');
  await say('volume', '5');
  goTo('/blog/some-article');
  await click(button('Edit Product'));
  await click(button('Dragon fruit'));
  assert.deepEqual(units(), TRADE_UNITS);
  await say('volume', '2');
  await click(button('Request Quotation'));
  await type(field('contact.company'), 'Importer Co');
  await type(field('contact.email'), 'buyer@example.com');
  await click(field('consent.contact'));
  await click(button('Send Request'));
  assert.equal(sent().at(-1).product, 'dragon-fruit');
  assert.equal(pageOfLast(), '/blog/some-article');
  assert.deepEqual(sent().at(-1).volume, { amount: '2', unit: 'containers' });
});

test('the same conversation, after the buyer moved on, is still sent from its segment page while it is about golden passion fruit', async () => {
  goTo(FOOD);
  await open({ product: 'passion-fruit', segment: 'foodservice', source: 'test' });
  await say('destination', 'Da Nang');
  goTo('/contact');
  await finish('12');
  assert.equal(pageOfLast(), FOOD);
});

test('editing a previous answer keeps the segment: the question and the units stay the page’s own', async () => {
  goTo(RETAIL);
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  await say('destination', 'Da Nang');
  await say('volume', '5');
  await click(button('Edit Volume'));
  assert.equal(thread().at(-1), `HMV: ${ASKS.retail}`);
  assert.deepEqual(units(), KG_UNITS);
  await click(button('Edit Destination'));
  await say('destination', 'Hue');
  assert.equal(thread().at(-1), `HMV: ${ASKS.retail}`);
  await finish('8');
  assert.equal(pageOfLast(), RETAIL);
  assert.equal(sent().at(-1).destination, 'Hue');
});

test('the Quick RFQ handoff keeps its segment, its page and its kilograms; an amount in units the page does not offer is asked again', async () => {
  goTo(FOOD);
  await open({ product: 'passion-fruit', segment: 'foodservice', destination: 'Da Nang', volume: { amount: '50', unit: 'kg_week' }, source: 'quick_rfq' });
  assert.ok(dialog().querySelector('.desk-summary').textContent.includes('50 kg / week'));
  await click(button('Request Quotation'));
  await type(field('contact.company'), 'Resort Co');
  await type(field('contact.email'), 'buyer@example.com');
  await click(field('consent.contact'));
  await click(button('Send Request'));
  assert.equal(pageOfLast(), FOOD);
  assert.deepEqual(sent().at(-1).volume, { amount: '50', unit: 'kg_week' });
  await closeDesk();
  // The home page offers no kilograms: "50 kg" is not kept as another unit, the volume is asked again.
  goTo('/');
  await open({ product: 'passion-fruit', destination: 'Rotterdam', volume: { amount: '50', unit: 'kg' }, source: 'quick_rfq' });
  assert.equal(thread().at(-1), `HMV: ${ASKS.generic}`);
  assert.equal(field('volume').value, '');
  assert.deepEqual(units(), TRADE_UNITS);
});

test('a failed send and its retry keep the segment, the page and the key; the retry after a page change is the same inquiry', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 503, body: { error: 'unavailable' } });
  goTo(RETAIL);
  await open({ product: 'passion-fruit', segment: 'retail', source: 'test' });
  await say('destination', 'Da Nang');
  await finish('10');
  assert.equal(sendInquiry.mock.calls.length, 1);
  goTo('/about');
  await click(button('Try again'));
  assert.equal(sendInquiry.mock.calls.length, 2);
  const [first, second] = sent();
  assert.equal(first.context.page, RETAIL);
  assert.equal(second.context.page, RETAIL);
  assert.equal(first.idempotencyKey, second.idempotencyKey);
  assert.ok(dialog().textContent.includes(REFERENCE));
});

test('language: switching the desk or the site language changes the words, not the segment, the units or the page', async () => {
  goTo(FOOD);
  await open({ product: 'passion-fruit', segment: 'foodservice', source: 'test' });
  await say('destination', 'Da Nang');
  await click(button('VI'));
  assert.equal(thread().at(-1), 'HMV: Doanh nghiệp khách sạn, nhà hàng hoặc đồ uống của anh/chị cần bao nhiêu chanh dây vàng?');
  assert.deepEqual(units(), KG_UNITS);
  // The site moves to the Vietnamese page of the same segment: the open conversation is the same one.
  goTo(FOOD_VI);
  await click(button('EN'));
  assert.equal(thread().at(-1), `HMV: ${ASKS.foodservice}`);
  await finish('15');
  assert.equal(pageOfLast(), FOOD);
  assert.equal(sent().at(-1).locale, 'en');
  await click(button('Start a new inquiry'));
  await say('destination', 'Hue');
  assert.equal(thread().at(-1), `HMV: ${ASKS.foodservice}`);
  assert.deepEqual(units(), KG_UNITS);
});

test('a segment that is not one of the product’s, whatever it is, is no segment: the usual question, units and page', async () => {
  for (const segment of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'Export', 'FOODSERVICE', 'wholesale', ' retail', '5']) {
    sendInquiry.mockClear();
    goTo('/about');
    await open({ product: 'passion-fruit', segment, source: 'test' });
    await say('destination', 'Da Nang');
    assert.equal(thread().at(-1), `HMV: ${ASKS.generic}`, segment);
    assert.deepEqual(units(), TRADE_UNITS, segment);
    await finish('3');
    assert.equal(pageOfLast(), '/about', segment);
    assert.deepEqual(sent().at(-1).volume, { amount: '3', unit: 'containers' }, segment);
    // The buyer has seen the result and closes: the next open of the desk is a new conversation.
    await closeDesk();
  }
});

test('a segment given for another product changes nothing about it: its units and its page are the usual ones', async () => {
  goTo(RETAIL);
  await open({ product: 'bananas', segment: 'retail', source: 'test' });
  await say('destination', 'Rotterdam');
  assert.equal(thread().at(-1), `HMV: ${ASKS.generic}`);
  assert.deepEqual(units(), TRADE_UNITS);
  goTo('/products/bananas');
  await finish('2');
  assert.equal(sent().at(-1).product, 'bananas');
  assert.equal(pageOfLast(), '/products/bananas');
});

test('the starting page is the opener’s, even when the buyer goes Back while the desk is still loading', async () => {
  goTo(RETAIL);
  // The open request arrives on the retail page; the history moves before the lazily loaded desk mounts.
  act(() => {
    openTradeDesk({ product: 'passion-fruit', segment: 'retail', source: 'test' });
    goTo('/about');
  });
  for (let i = 0; i < 300 && !dialog(); i++) await tick();
  assert.ok(dialog());
  await say('destination', 'Da Nang');
  assert.equal(thread().at(-1), `HMV: ${ASKS.retail}`);
  await finish('4');
  assert.equal(pageOfLast(), RETAIL);
});
