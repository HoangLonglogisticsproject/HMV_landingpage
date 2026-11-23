// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { FOCUS_QUICK_RFQ } from '@/features/inquiries/focus';
import { OPEN_TRADE_DESK } from '@/features/trade-desk/open';
import { CinematicHero } from './CinematicHero.jsx';
import { FinalCta } from './FinalCta.jsx';
import { StickySupplyCta } from './StickySupplyCta.jsx';
import { TrustStrip } from './TrustStrip.jsx';

// The homepage's journey: the hero's two lanes, the way back to the Quick RFQ (the closing call to action and the
// phone's sticky one), and the proof strip. The form itself is tested with QuickRfq; the order of the sections, with
// the browser (tests/next/home-journey.spec.js).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let root, container, focusEvents, deskEvents;
const onFocus = () => focusEvents.push(true);
const onDesk = event => deskEvents.push(event.detail);
const render = async (element, lang = 'en') => act(async () => root.render(h(MemoryRouter, null, h(element, { lang }, h('div', { id: 'slot' }, 'the form')))));
const button = text => [...container.querySelectorAll('button')].find(b => b.textContent.includes(text));
const click = el => act(async () => el.click());
const events = () => window.dataLayer ?? [];

beforeEach(() => {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  focusEvents = [];
  deskEvents = [];
  window.addEventListener(FOCUS_QUICK_RFQ, onFocus);
  window.addEventListener(OPEN_TRADE_DESK, onDesk);
  delete window.dataLayer;
});
afterEach(async () => {
  window.removeEventListener(FOCUS_QUICK_RFQ, onFocus);
  window.removeEventListener(OPEN_TRADE_DESK, onDesk);
  await act(async () => root.unmount());
  container.remove();
  document.body.innerHTML = '';
});

test('hero: one h1; the primary lane takes the buyer to the Quick RFQ and opens no desk, the secondary opens the Trade Desk', async () => {
  await render(CinematicHero);
  assert.equal(container.querySelectorAll('h1').length, 1);
  assert.equal(container.querySelector('h1').textContent, 'Rooted in the land.Connecting the world.');
  // The form is the hero's child, placed once.
  assert.equal(container.querySelectorAll('#slot').length, 1);

  const primary = button('Get Supply Proposal');
  const secondary = button('Need guidance? Ask HMV Trade Desk');
  assert.ok(primary && secondary);
  // Not equally primary: the primary is the button, the secondary the text link.
  assert.match(primary.className, /day-cta/);
  assert.match(secondary.className, /text-link/);
  assert.doesNotMatch(secondary.className, /day-cta/);

  await click(primary);
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(deskEvents, []);
  assert.deepEqual(events(), [{ event: 'home_supply_plan_click', source: 'hero', locale: 'en' }]);

  await click(secondary);
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(deskEvents, [{ source: 'home_hero_assisted' }]);
  // The desk's own opening is counted by the desk's host, never twice here.
  assert.equal(events().length, 1);
});

test('hero: Vietnamese copy; the lane is the same', async () => {
  await render(CinematicHero, 'vi');
  assert.equal(container.querySelector('h1').textContent, 'Bám rễ từ đất lành.Vươn tầm ra thế giới.');
  await click(button('Nhận phương án cung ứng'));
  await click(button('Cần tư vấn? Trao đổi với HMV Trade Desk'));
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(deskEvents, [{ source: 'home_hero_assisted' }]);
  assert.deepEqual(events(), [{ event: 'home_supply_plan_click', source: 'hero', locale: 'vi' }]);
});

test('hero: the LCP image keeps its measured size, priority and eagerness; the second image stays lazy', async () => {
  await render(CinematicHero);
  const [lcp, ocean] = [...container.querySelectorAll('img')];
  assert.equal(lcp.getAttribute('loading'), 'eager');
  assert.equal(lcp.getAttribute('fetchpriority'), 'high');
  assert.equal(ocean.getAttribute('loading'), 'lazy');
  assert.equal(container.querySelectorAll('img[loading="eager"]').length, 1);
});

test('final call to action: the Quick RFQ again and the Trade Desk, no second form', async () => {
  await render(FinalCta);
  assert.equal(container.querySelectorAll('form, input, select, textarea').length, 0);
  assert.equal(container.querySelector('h2').textContent, 'Ready to discuss your sourcing requirement?');
  await click(button('Get Supply Proposal'));
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(deskEvents, []);
  assert.deepEqual(events(), [{ event: 'home_supply_plan_click', source: 'final', locale: 'en' }]);
  await click(button('Ask HMV Trade Desk'));
  assert.deepEqual(deskEvents, [{ source: 'home_final_assisted' }]);
});

test('final call to action: the leadership’s addresses are a quiet disclosure, closed by default', async () => {
  await render(FinalCta, 'vi');
  assert.equal(container.querySelector('h2').textContent, 'Sẵn sàng trao đổi nhu cầu thu mua của bạn?');
  const direct = container.querySelector('details');
  assert.equal(direct.open, false);
  assert.equal(direct.querySelector('summary').textContent, 'Muốn liên hệ trực tiếp với HMV?');
  assert.equal(direct.querySelectorAll('a[href^="mailto:"]').length, 3);
  assert.ok(container.querySelector('section[data-final-cta]'));
});

test('proof strip: the site’s own heading and four commitments, a way to the real work, and no figure or name added', async () => {
  await render(TrustStrip);
  assert.equal(container.querySelector('h2').textContent, 'Built around the buyer.');
  assert.deepEqual([...container.querySelectorAll('li')].map(li => li.textContent), [
    'End-to-End Supply Chain', 'Strict Quality Control', 'Export Documentation Coordination', 'One Commercial Point of Contact',
  ]);
  assert.equal(container.querySelector('a[href="/activities"]').textContent, 'See HMV in action');
  assert.doesNotMatch(container.textContent, /\d/);
  await render(TrustStrip, 'vi');
  assert.equal(container.querySelector('h2').textContent, 'Xuất phát từ nhu cầu người mua.');
  assert.equal(container.querySelectorAll('li').length, 4);
});

// The observer: a stand-in that holds its callback and the elements it was given, so a test can say what the browser
// would report.
class FakeObserver {
  static all = [];
  constructor(callback) {
    this.callback = callback;
    this.targets = [];
    this.disconnected = false;
    FakeObserver.all.push(this);
  }
  observe(el) { this.targets.push(el); }
  disconnect() { this.disconnected = true; }
}
const report = (observer, target, { ratio = 0, top = 0, intersecting = ratio > 0 }) =>
  act(async () => observer.callback([{ target, intersectionRatio: ratio, isIntersecting: intersecting, boundingClientRect: { top } }]));

/** The page the sticky button watches: the Quick RFQ (#initiate-trade) and the closing call to action. */
function pageWithForm() {
  const form = Object.assign(document.createElement('section'), { id: 'initiate-trade' });
  const end = Object.assign(document.createElement('section'), {});
  end.setAttribute('data-final-cta', '');
  document.body.append(form, end);
  return { form, end };
}

test('sticky call to action: hidden until the buyer has scrolled past the form; gone while the form is in view and at the end', async () => {
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  FakeObserver.all = [];
  const { form, end } = pageWithForm();
  await render(StickySupplyCta);
  const bar = container.querySelector('[data-sticky-supply-cta]');
  const [observer] = FakeObserver.all;
  assert.deepEqual(observer.targets, [form, end]);
  // At the top of the page the form is in view or below: nothing shows (and it is not in the HTML flow: `hidden`).
  assert.equal(bar.hidden, true);
  await report(observer, form, { ratio: 0.6, top: 400 });
  assert.equal(bar.hidden, true);
  await report(observer, form, { ratio: 0, top: 900, intersecting: false });
  assert.equal(bar.hidden, true);

  // Scrolled past it: the form is above the viewport.
  await report(observer, form, { ratio: 0, top: -700, intersecting: false });
  assert.equal(bar.hidden, false);
  // A sliver at the top edge is not "meaningfully visible".
  await report(observer, form, { ratio: 0.05, top: -600 });
  assert.equal(bar.hidden, false);
  // Scrolling back up: the form comes into view and the bar goes.
  await report(observer, form, { ratio: 0.4, top: -200 });
  assert.equal(bar.hidden, true);
  await report(observer, form, { ratio: 0, top: -700, intersecting: false });
  assert.equal(bar.hidden, false);
  // The closing call to action says the same: from there on, no bar; and none below it either.
  await report(observer, end, { ratio: 0.2, top: 500 });
  assert.equal(bar.hidden, true);
  await report(observer, end, { ratio: 0, top: -300, intersecting: false });
  assert.equal(bar.hidden, true);
  // Back above the closing call to action: it shows again.
  await report(observer, end, { ratio: 0, top: 1200, intersecting: false });
  assert.equal(bar.hidden, false);

  await act(async () => root.render(h('div')));
  assert.equal(observer.disconnected, true);
  vi.unstubAllGlobals();
});

test('sticky call to action: on a phone only, safe-area aware, no motion for reduced-motion users; it returns the buyer to the form', async () => {
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  FakeObserver.all = [];
  const { form } = pageWithForm();
  await render(StickySupplyCta);
  const bar = container.querySelector('[data-sticky-supply-cta]');
  // From 901 px the single-column layout is gone, and so is the bar.
  assert.match(bar.className, /min-\[901px\]:hidden/);
  assert.match(bar.className, /pb-\[calc\(12px\+env\(safe-area-inset-bottom/);
  assert.match(bar.className, /pointer-events-none/);
  // The animation is for those who have not asked for less motion.
  const motion = bar.className.split(' ').filter(c => /animate|slide-in|fade-in/.test(c));
  assert.ok(motion.length > 0 && motion.every(c => c.startsWith('motion-safe:')), motion.join(' '));

  await report(FakeObserver.all[0], form, { ratio: 0, top: -900, intersecting: false });
  await click(button('Get Supply Proposal'));
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(events(), [{ event: 'home_supply_plan_click', source: 'sticky', locale: 'en' }]);
  // Nothing is mounted or reset by it: the bar only asks the form to take the buyer back.
  assert.equal(deskEvents.length, 0);
  vi.unstubAllGlobals();
});

test('sticky call to action: without the form or the closing call to action on the page it never shows and observes nothing', async () => {
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  FakeObserver.all = [];
  await render(StickySupplyCta, 'vi');
  assert.equal(FakeObserver.all.length, 0);
  assert.equal(container.querySelector('[data-sticky-supply-cta]').hidden, true);
  assert.ok(button('Nhận phương án cung ứng'));
  vi.unstubAllGlobals();
});
