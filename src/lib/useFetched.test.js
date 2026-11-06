// @vitest-environment jsdom
import { afterEach, beforeEach, test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement as h } from 'react';
import { createRoot } from 'react-dom/client';
import { useFetched } from './useFetched.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// A `load` whose calls stay pending until the test settles them, in any order.
function deferredLoad() {
  const calls = [];
  const load = signal => new Promise((resolve, reject) => calls.push({ signal, resolve, reject }));
  return { calls, load };
}

let root, state;
function Probe({ k, load, report }) {
  report(useFetched(k, load));
  return null;
}
const show = (k, load) => act(() => root.render(h(Probe, { k, load, report: s => (state = s) })));

beforeEach(() => {
  root = createRoot(document.createElement('div'));
});
afterEach(() => act(() => root.unmount()));

test('loading until the load settles, then its result tagged with the key', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  assert.deepEqual(state, { status: 'loading' });
  assert.equal(calls.length, 1);
  await act(async () => calls[0].resolve({ status: 'ready', page: 'en' }));
  assert.deepEqual(state, { key: 'about|en', status: 'ready', page: 'en' });
});

test('a rejected load becomes the error state, with the error', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  const error = Object.assign(new Error('CMS 503'), { status: 503 });
  await act(async () => calls[0].reject(error));
  assert.deepEqual(state, { key: 'about|en', status: 'error', error });
});

test('re-rendering with the same key does not load again', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  await show('about|en', load);
  assert.equal(calls.length, 1);
});

test('a new key aborts the in-flight load and shows loading, never the previous result', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  await act(async () => calls[0].resolve({ status: 'ready', page: 'en' }));
  await show('about|vi', load);
  assert.deepEqual(state, { status: 'loading' });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].signal.aborted, true);
  assert.equal(calls[1].signal.aborted, false);
});

test('a superseded load that resolves late does not overwrite the newer result', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  await show('about|vi', load);
  await act(async () => calls[1].resolve({ status: 'ready', page: 'vi' }));
  await act(async () => calls[0].resolve({ status: 'ready', page: 'en' }));
  assert.deepEqual(state, { key: 'about|vi', status: 'ready', page: 'vi' });
});

test('a superseded load that fails late (fetch AbortError) does not overwrite the newer result', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  await show('about|vi', load);
  await act(async () => calls[1].resolve({ status: 'not-found' }));
  await act(async () => calls[0].reject(new DOMException('aborted', 'AbortError')));
  assert.deepEqual(state, { key: 'about|vi', status: 'not-found' });
});

test('unmounting aborts the in-flight load', async () => {
  const { calls, load } = deferredLoad();
  await show('about|en', load);
  await act(() => root.unmount());
  assert.equal(calls[0].signal.aborted, true);
  root = createRoot(document.createElement('div')); // afterEach unmounts a root
});
