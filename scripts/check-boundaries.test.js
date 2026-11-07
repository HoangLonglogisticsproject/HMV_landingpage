import { test } from 'vitest';
import assert from 'node:assert/strict';
import { findViolations } from './check-boundaries.js';

// A minimal tree with one file per layer. Each test adds the file under test and checks the violations.
const TREE = {
  'src/lib/utils.js': 'export const cn = () => {};',
  'src/i18n/routes.js': 'export const LOCALES = [];',
  'src/views/home/HomeView.jsx': 'export function HomeView() {}',
  'src/views/home/HomePage.jsx': "import { HomeView } from './HomeView';",
  'src/app/App.jsx': 'export default function App() {}',
  'src/app/navigation.jsx': "export { Link } from 'react-router-dom';",
  'src/next/navigation.jsx': "export { default as Link } from 'next/link';",
  'src/next/seo.ts': "import type { Metadata } from 'next';",
  'app/(en)/(site)/page.tsx': "import { HomeView } from '@/views/home/HomeView';",
  'proxy.ts': "import { NextResponse } from 'next/server';",
};
const check = (file, code) => findViolations(new Map([...Object.entries(TREE), [file, code]])).filter(v => v.startsWith(file));

const SHARED = 'src/views/about/AboutView.jsx';
const VITE = 'src/views/about/AboutPage.jsx';
const NEXT = 'app/(en)/(site)/about/page.tsx';

test('the repository fixture itself has no violations', () => {
  assert.deepEqual(findViolations(new Map(Object.entries(TREE))), []);
});

test('pass: shared → shared through every import form in use', () => {
  const forms = [
    "import { cn } from '@/lib/utils';",
    "import { cn } from '../../lib/utils.js';",
    "import { HomeView } from '../home/HomeView';",
    "export { cn } from '@/lib/utils';",
    "export * from '@/i18n/routes';",
    "import '@/lib/utils';",
    "const m = await import('@/lib/utils');",
    "import {\n  cn,\n} from '@/lib/utils';",
    "import type { X } from '@/lib/utils';",
    // The navigation port is the one framework-dependent path shared code may name.
    "import { Link } from '@/lib/navigation';",
  ];
  for (const code of forms) assert.deepEqual(check(SHARED, code), [], code);
});

test('pass: vite → shared and vite, with its framework packages, env and fetch', () => {
  const code = [
    "import { HomeView } from '@/views/home/HomeView';",
    "import App from '@/app/App';",
    "import { Link } from 'react-router-dom';",
    "import { Helmet } from 'react-helmet-async';",
    'const on = import.meta.env.VITE_CMS_CONTENT;',
    'await fetch(url);',
  ].join('\n');
  assert.deepEqual(check(VITE, code), []);
});

test('pass: next → shared and next, with its framework packages, env and fetch', () => {
  const code = [
    "import 'server-only';",
    "import { HomeView } from '@/views/home/HomeView';",
    "import { pageMetadata } from '@/next/seo';",
    "import { notFound } from 'next/navigation';",
    'const origin = process.env.CMS_API_ORIGIN;',
    'await fetch(origin);',
  ].join('\n');
  assert.deepEqual(check(NEXT, code), []);
});

test('fail: shared → vite (relative, alias, re-export, dynamic import)', () => {
  for (const code of [
    "import { HomePage } from '../home/HomePage';",
    "import App from '@/app/App';",
    "export { Link } from '@/app/navigation';",
    "const m = import('@/views/home/HomePage');",
  ]) assert.equal(check(SHARED, code).length, 1, code);
});

test('fail: shared → next, including the port implementation itself', () => {
  for (const code of ["import { pageMetadata } from '@/next/seo';", "import { Link } from '@/next/navigation';", "export * from '../../next/seo';"]) {
    assert.equal(check(SHARED, code).length, 1, code);
  }
});

test('fail: vite → next and next → vite', () => {
  assert.equal(check(VITE, "import { pageMetadata } from '@/next/seo';").length, 1);
  assert.equal(check(NEXT, "import { HomePage } from '@/views/home/HomePage';").length, 1);
  assert.equal(check('src/next/content.ts', "import App from '../app/App.jsx';").length, 1);
});

test('fail: a framework package in the wrong layer', () => {
  for (const code of ["import Link from 'next/link';", "import { Link } from 'react-router-dom';", "import 'server-only';"]) {
    assert.equal(check(SHARED, code).length, 1, code);
  }
  assert.equal(check(VITE, "import { useRouter } from 'next/navigation';").length, 1);
  assert.equal(check(NEXT, "import { Helmet } from 'react-helmet-async';").length, 1);
});

test('fail: shared code calls fetch or reads the environment', () => {
  assert.deepEqual(check(SHARED, 'await fetch(url);'), [`${SHARED}: shared code calls fetch`]);
  assert.deepEqual(check(SHARED, 'const o = process.env.CMS_API_ORIGIN;'), [`${SHARED}: shared code reads the environment`]);
  assert.deepEqual(check(SHARED, 'const on = import.meta.env.VITE_CMS_CONTENT;'), [`${SHARED}: shared code reads the environment`]);
});
