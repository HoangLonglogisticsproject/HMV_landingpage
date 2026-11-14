// @vitest-environment jsdom
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageProvider } from '../i18n/LanguageContext.jsx';
import { useLanguageSwitch } from './navigation.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The Vite build has no page-scoped locale (those pages are Next.js only): its switcher lists English and Vietnamese,
// and switching is a re-render, not a link.
test('Vite useLanguageSwitch: no page-scoped locales and no language URLs', async () => {
  let result;
  const Probe = () => ((result = useLanguageSwitch()), null);
  const root = createRoot(document.createElement('div'));
  await act(() => root.render(h(LanguageProvider, null, h(Probe))));
  assert.deepEqual(result.scoped, []);
  assert.equal(result.hrefFor('vi'), undefined);
  await act(() => root.unmount());
});
