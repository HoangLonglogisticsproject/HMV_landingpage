import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
const { scripts } = JSON.parse(read('package.json'));

test('Next.js is the default: dev, build and start run it on the established port 4175, and the next:* aliases stay', () => {
  assert.equal(scripts.dev, 'next dev -p 4175');
  assert.equal(scripts.build, 'next build');
  assert.equal(scripts.start, 'next start -p 4175');
  assert.equal(scripts['next:dev'], scripts.dev);
  assert.equal(scripts['next:build'], scripts.build);
  assert.equal(scripts['next:start'], scripts.start);
});

test('Vite stays available under vite:*, and nothing else runs Vite', () => {
  assert.equal(scripts['vite:dev'], 'vite');
  assert.equal(scripts['vite:build'], 'vite build');
  assert.equal(scripts['vite:preview'], 'vite preview');
  assert.equal(scripts['vite:dev:cms'], 'vite --mode cms');
  assert.equal(scripts['vite:build:cms'], 'vite build --mode cms --outDir dist-cms');
  for (const [name, command] of Object.entries(scripts)) {
    if (!name.startsWith('vite:')) assert.ok(!/\bvite\b/.test(command.replace(/vite:\w+(:\w+)?/g, '')), `${name} runs Vite directly: ${command}`);
  }
});

test('no script calls itself, directly or through another script, and every npm run target exists', () => {
  const calls = command => [...command.matchAll(/npm run ([\w:-]+)/g)].map(m => m[1]);
  for (const [name, command] of Object.entries(scripts)) {
    for (const target of calls(command)) assert.ok(Object.hasOwn(scripts, target), `${name} -> ${target} does not exist`);
  }
  const reaches = (from, seen = new Set()) => {
    for (const target of calls(scripts[from])) {
      if (seen.has(target)) continue;
      seen.add(target);
      reaches(target, seen);
    }
    return seen;
  };
  for (const name of Object.keys(scripts)) assert.ok(!reaches(name).has(name), `${name} reaches itself`);
});

test('the Vite end-to-end suites build and serve Vite, never Next.js, and the Next.js ones build Next.js', () => {
  assert.match(scripts['test:e2e'], /vite:build && npm run vite:build:cms/);
  assert.match(scripts['test:e2e:cms'], /vite:build:cms/);
  assert.match(scripts['test:visual'], /vite:build/);
  assert.match(scripts['test:e2e:next'], /next:build/);
  assert.match(read('playwright.config.js'), /'npm run vite:build && npm run vite:preview'/);
  assert.match(read('playwright.cms.config.js'), /npm run vite:build:cms/);
  for (const file of ['playwright.config.js', 'playwright.cms.config.js']) assert.doesNotMatch(read(file), /npm run (build|preview|build:cms)\b/, file);
  // The deployment builds Next.js.
  assert.equal(JSON.parse(read('vercel.json')).framework, 'nextjs');
});
