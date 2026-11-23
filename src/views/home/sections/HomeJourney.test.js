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

// The page the sticky button reads: the Quick RFQ (#initiate-trade) and the closing call to action, whose positions a test
// sets by hand (jsdom has no layout), and the scroll that tells the button to look.
const VIEWPORT = 800;
function pageWithForm() {
  const form = Object.assign(document.createElement('section'), { id: 'initiate-trade' });
  const end = document.createElement('section');
  end.setAttribute('data-final-cta', '');
  document.body.append(form, end);
  const place = (el, top, height) => { el.getBoundingClientRect = () => ({ top, bottom: top + height, height }); };
  const scrollTo = async ({ form: formTop, end: endTop }) => {
    place(form, formTop, 700);
    place(end, endTop, 400);
    await act(async () => window.dispatchEvent(new Event('scroll')));
  };
  return { form, end, scrollTo };
}
const stubFrames = () => {
  // A frame comes after the current task, as in a browser (a callback run inside requestAnimationFrame() would see its
  // own frame id unset).
  vi.stubGlobal('requestAnimationFrame', callback => { queueMicrotask(callback); return 1; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('innerHeight', VIEWPORT);
};

test('sticky call to action: hidden until the buyer has scrolled past the form; gone while the form is in view and at the end', async () => {
  stubFrames();
  const { scrollTo } = pageWithForm();
  await render(StickySupplyCta);
  const bar = container.querySelector('[data-sticky-supply-cta]');
  // At the top of the page the form is in view or below: nothing shows (and it is not in the HTML flow: `hidden`).
  assert.equal(bar.hidden, true);
  await scrollTo({ form: 560, end: 9000 });
  assert.equal(bar.hidden, true);
  await scrollTo({ form: 900, end: 9000 });
  assert.equal(bar.hidden, true);

  // Scrolled past it: the form is above the viewport.
  await scrollTo({ form: -900, end: 7000 });
  assert.equal(bar.hidden, false);
  // A sliver at the top edge is not "meaningfully visible" (15 % of 700 px is 105 px).
  await scrollTo({ form: -640, end: 7000 });
  assert.equal(bar.hidden, false);
  // Scrolling back up: 200 px of the form is in view and the bar goes.
  await scrollTo({ form: -500, end: 7000 });
  assert.equal(bar.hidden, true);
  await scrollTo({ form: -1200, end: 6000 });
  assert.equal(bar.hidden, false);
  // The closing call to action says the same: once it enters the viewport, no bar, and none below it either.
  await scrollTo({ form: -5000, end: 600 });
  assert.equal(bar.hidden, true);
  await scrollTo({ form: -6000, end: -300 });
  assert.equal(bar.hidden, true);
  // Back above the closing call to action: it shows again.
  await scrollTo({ form: -2000, end: 4000 });
  assert.equal(bar.hidden, false);
  vi.unstubAllGlobals();
});

test('sticky call to action: a jump past the form that never intersects it (a landscape phone, End, an anchor) still shows it', async () => {
  stubFrames();
  const { scrollTo } = pageWithForm();
  await render(StickySupplyCta);
  const bar = container.querySelector('[data-sticky-supply-cta]');
  // The form starts below the fold and the next sample has it above the viewport: no frame ever has it in view.
  await scrollTo({ form: 1200, end: 9000 });
  assert.equal(bar.hidden, true);
  await scrollTo({ form: -3000, end: 6000 });
  assert.equal(bar.hidden, false);
  vi.unstubAllGlobals();
});

test('sticky call to action: one look per frame while scrolling, passive listeners that go with the button', async () => {
  const frames = [];
  vi.stubGlobal('requestAnimationFrame', callback => { frames.push(callback); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('innerHeight', VIEWPORT);
  const { form } = pageWithForm();
  const spy = vi.spyOn(form, 'getBoundingClientRect');
  const add = vi.spyOn(window, 'addEventListener');
  const remove = vi.spyOn(window, 'removeEventListener');
  await render(StickySupplyCta);
  assert.deepEqual(add.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize').map(([type, , options]) => [type, options]),
    [['scroll', { passive: true }], ['resize', undefined]]);
  // The first look is a frame of its own; a burst of scroll events within one frame asks for no more than that.
  assert.equal(frames.length, 1);
  for (let i = 0; i < 20; i++) window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.length, 1);
  await act(async () => frames.shift()());
  assert.equal(spy.mock.calls.length, 1);
  window.dispatchEvent(new Event('scroll'));
  assert.equal(frames.length, 1);

  await act(async () => root.render(h('div')));
  assert.deepEqual(remove.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize').map(([type]) => type), ['scroll', 'resize']);
  add.mockRestore();
  remove.mockRestore();
  vi.unstubAllGlobals();
});

test('sticky call to action: on a phone only, safe-area aware, no motion for reduced-motion users; it returns the buyer to the form', async () => {
  stubFrames();
  const { scrollTo } = pageWithForm();
  await render(StickySupplyCta);
  const bar = container.querySelector('[data-sticky-supply-cta]');
  // From 901 px the single-column layout is gone, and so is the bar.
  assert.match(bar.className, /min-\[901px\]:hidden/);
  assert.match(bar.className, /pb-\[calc\(12px\+env\(safe-area-inset-bottom/);
  assert.match(bar.className, /pointer-events-none/);
  // The animation is for those who have not asked for less motion.
  const motion = bar.className.split(' ').filter(c => /animate|slide-in|fade-in/.test(c));
  assert.ok(motion.length > 0 && motion.every(c => c.startsWith('motion-safe:')), motion.join(' '));

  await scrollTo({ form: -900, end: 7000 });
  assert.equal(bar.hidden, false);
  await click(button('Get Supply Proposal'));
  assert.equal(focusEvents.length, 1);
  assert.deepEqual(events(), [{ event: 'home_supply_plan_click', source: 'sticky', locale: 'en' }]);
  // Nothing is mounted or reset by it: the bar only asks the form to take the buyer back.
  assert.equal(deskEvents.length, 0);
  vi.unstubAllGlobals();
});

test('sticky call to action: without the form or the closing call to action on the page it never shows and listens to nothing', async () => {
  const add = vi.spyOn(window, 'addEventListener');
  await render(StickySupplyCta, 'vi');
  assert.equal(add.mock.calls.filter(([type]) => type === 'scroll').length, 0);
  add.mockRestore();
  assert.equal(container.querySelector('[data-sticky-supply-cta]').hidden, true);
  assert.ok(button('Nhận phương án cung ứng'));
  vi.unstubAllGlobals();
});
