// @vitest-environment jsdom
import { afterEach, beforeEach, test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { vnCambodiaConsolidation } from '@/data/vnCambodiaConsolidation';
import { createInquiryMailto } from '@/features/inquiries/inquiry';
import { sendInquiry } from '@/lib/inquiry';
import { ConsolidationView } from './ConsolidationView.jsx';
import { ENDPOINT } from './RouteAssessmentForm.jsx';

vi.mock('@/lib/inquiry', () => ({ sendInquiry: vi.fn(), contactChannels: {} }));
vi.mock('@/features/inquiries/inquiry', () => ({ createInquiryMailto: vi.fn(() => '#email-draft') }));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
vi.setConfig({ testTimeout: 20_000 });

let root, container;
beforeEach(() => {
  sendInquiry.mockReset();
  window.dataLayer = [];
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const render = lang => act(() => root.render(h(MemoryRouter, null, h('main', null, h(ConsolidationView, { lang })))));
const $ = selector => container.querySelector(selector);
const SECTIONS = ['overview', 'audience', 'when-to-consolidate', 'workflow', 'corridor', 'shipment-information', 'boundaries', 'faq', 'route-assessment'];

for (const lang of ['en', 'vi']) {
  const c = vnCambodiaConsolidation[lang];
  test(`${lang}: one h1; every section in page order, named by its heading; links back to the logistics hub`, async () => {
    await render(lang);
    assert.deepEqual([...container.querySelectorAll('h1')].map(e => e.textContent), [c.hero.h1]);
    const sections = [...container.querySelectorAll('main section')];
    assert.deepEqual(sections.map(s => s.id), SECTIONS);
    for (const s of sections) assert.equal($(`#${s.getAttribute('aria-labelledby')}`).closest('section'), s, s.id);
    assert.ok($('a[href="/logistics"]'));
    assert.ok($('a[href="/logistics#cross-border"]'));
    // The approved workflow, in order; questions closed, answers in the HTML.
    assert.deepEqual([...container.querySelectorAll('#workflow li h3')].map(e => e.textContent), c.workflow.steps.map(s => s.title));
    assert.equal(c.workflow.steps.length, 9);
    assert.equal(container.querySelectorAll('#faq details').length, c.faq.items.length);
    assert.equal($('#faq details[open]'), null);
    // The form: every field labelled, the optional ones said to be.
    for (const field of ['origin', 'destination', 'cargo', 'volume', 'frequency', 'notes', 'company', 'name', 'email', 'phone']) {
      const input = $(`[name="${field}"]`);
      assert.equal($(`label[for="${input.id}"]`).firstChild.textContent, c.form.labels[field], field);
    }
    assert.ok($('label[for$="-frequency"]').textContent.includes(c.form.optional));
  });
}

/** Types into a field the way a person does: React sees the input event. */
const type = (name, value) => {
  const input = $(`[name="${name}"]`);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set;
  setter.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};
async function fill() {
  await act(() => {
    for (const [name, value] of Object.entries({ origin: 'Binh Duong', destination: 'Phnom Penh', cargo: 'Cartons of parts', volume: '2 CBM', company: 'Factory Co', email: 'ops@factory.example' })) type(name, value);
    $('input[type="checkbox"]').click();
  });
}
const submit = () => act(() => $('form button[type="submit"]:last-of-type').click());

test('an empty request is not sent: each required field and the consent show their error, the first focused', async () => {
  await render('en');
  await submit();
  assert.equal(sendInquiry.mock.calls.length, 0);
  const invalid = [...container.querySelectorAll('[aria-invalid="true"]')].map(e => e.getAttribute('data-field'));
  assert.deepEqual(invalid, ['origin', 'destination', 'cargo', 'volume', 'contact.company', 'contact.email', 'consent.contact']);
  assert.equal(document.activeElement.name, 'origin');
  assert.equal($('#' + CSS.escape($('[name="origin"]').getAttribute('aria-describedby'))).textContent, 'Enter the pickup location.');
  // Corrected, a field loses its error at once.
  await act(() => type('origin', 'Binh Duong'));
  assert.equal($('[name="origin"]').getAttribute('aria-invalid'), null);
});

test('sent: the request carries the service, its source and the page; "sent" and the reference only after a 201', async () => {
  sendInquiry.mockResolvedValueOnce({ status: 201, body: { reference: 'HMV-2026-7KQ4XM' } });
  await render('en');
  await fill();
  await submit();
  const [request, options] = sendInquiry.mock.calls[0];
  assert.deepEqual(options, { url: ENDPOINT });
  assert.equal(ENDPOINT, '/api/route-assessment');
  assert.deepEqual([request.service, request.source, request.locale, request.context.page], ['vietnam-cambodia-consolidation', 'en_route_assessment', 'en', location.pathname]);
  assert.deepEqual(request.contact, { company: 'Factory Co', email: 'ops@factory.example', name: '', phone: '' });
  assert.deepEqual(request.consent, { contact: true });
  assert.match(request.idempotencyKey, /^[A-Za-z0-9-]{8,64}$/);
  assert.ok($('output').textContent.includes('HMV-2026-7KQ4XM'));
  assert.deepEqual(window.dataLayer, [{ event: 'generate_lead', product: 'vietnam-cambodia-consolidation', locale: 'en', route: 'route_assessment' }]);
  // Another request starts empty.
  await act(() => $('output button').click());
  assert.equal($('[name="origin"]').value, '');
});

test('failed: the answers kept, a retry with the same key, the email draft; a 409 takes a new key', async () => {
  sendInquiry.mockResolvedValue({ status: 503, body: { error: 'unavailable' } });
  await render('vi');
  await fill();
  await submit();
  const alert = $('[role="alert"]');
  assert.ok(alert.textContent.includes(vnCambodiaConsolidation.vi.form.failed.text));
  assert.equal($('[name="origin"]').value, 'Binh Duong');
  await act(() => alert.querySelector('button[type="submit"]').click());
  const keys = () => sendInquiry.mock.calls.map(([r]) => r.idempotencyKey);
  assert.equal(keys()[1], keys()[0]);
  sendInquiry.mockResolvedValueOnce({ status: 409, body: { error: 'conflict' } });
  await submit();
  await submit();
  assert.notEqual(keys()[3], keys()[2]);
  const assign = vi.fn();
  vi.stubGlobal('location', { ...location, assign, pathname: location.pathname });
  await act(() => [...$('[role="alert"]').querySelectorAll('button')].at(-1).click());
  vi.unstubAllGlobals();
  assert.deepEqual(assign.mock.calls, [['#email-draft']]);
  assert.deepEqual(createInquiryMailto.mock.calls.at(-1)[0], {
    company: 'Factory Co', name: '', email: 'ops@factory.example', product: 'Vietnam–Cambodia Consolidation', destination: 'Phnom Penh', volume: '2 CBM',
    requirements: [['Origin', 'Binh Duong'], ['Cargo', 'Cartons of parts'], ['Expected frequency', '']], message: '',
  });
});

test("the server's field errors are shown at their fields", async () => {
  sendInquiry.mockResolvedValueOnce({ status: 400, body: { error: 'invalid', fields: ['contact.email'] } });
  await render('en');
  await fill();
  await submit();
  assert.equal($('[name="email"]').getAttribute('aria-invalid'), 'true');
  assert.equal($('[role="alert"]'), null);
});
