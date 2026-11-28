import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { PRODUCT_ID, SEGMENTS, passionFruitMeta, passionFruitPages, segmentPath } from './passionFruitPages.js';
import { passionFruitMedia } from './passionFruitMedia.js';
import { claimsIn } from './unsupportedClaims.js';

const flat = value => (value && typeof value === 'object' ? Object.values(value).flatMap(flat) : [value]).filter(v => typeof v === 'string');

test('the copy, the metadata, the captions and the image descriptions make no claim HMV cannot document', () => {
  for (const lang of ['en', 'vi']) {
    for (const [where, tree] of [['pages', passionFruitPages[lang]], ['media', Object.values(passionFruitMedia).map(m => [m.alt[lang], m.caption[lang]])]]) {
      for (const text of flat(tree)) assert.deepEqual(claimsIn(text), [], `${lang} ${where}: ${text}`);
    }
  }
});

test('the guard catches what it is for, and lets a page say what it does not offer', () => {
  for (const text of ['Certified organic passion fruit', 'USDA Organic and GLOBALG.A.P.', 'Brix 16', 'Grade A fruit', 'From $4 per kg', 'Our farms in Dong Nai',
    'Trusted by leading hotels', 'MOQ 500 kg', 'Guaranteed delivery in 14 days', 'Hữu cơ', '10 MT per month capacity']) {
    assert.notDeepEqual(claimsIn(text), [], text);
  }
  for (const text of ['HMV does not publish prices, price tiers or margins on this page.', 'No fixed Brix is promised.', 'Packaging arrangements are subject to buyer requirements.',
    'Fresh whole golden passion fruit', 'Not confirmed HMV packaging', 'Delivery is arranged according to the agreement.', 'No guarantee is given on this page.']) {
    assert.deepEqual(claimsIn(text), [], text);
  }
});

test('every segment has complete English and Vietnamese copy, the same shape in both, and its own path and metadata', () => {
  const shape = tree => (tree && typeof tree === 'object' ? Object.keys(tree).map(k => `${k}:${shape(tree[k])}`).join(',') : typeof tree);
  for (const segment of SEGMENTS) {
    assert.equal(shape(passionFruitPages.en[segment]), shape(passionFruitPages.vi[segment]), segment);
    for (const text of flat(passionFruitPages.vi[segment])) assert.ok(text.trim() !== '', segment);
  }
  assert.equal(new Set(SEGMENTS.map(s => segmentPath(s))).size, 3);
  assert.equal(segmentPath('export'), `/products/${PRODUCT_ID}`);
  for (const lang of ['en', 'vi']) assert.equal(new Set(SEGMENTS.map(s => passionFruitMeta(lang, s).title)).size, 3, lang);
});

test('no image description or caption turns a file name into a claim', () => {
  for (const { alt, caption } of Object.values(passionFruitMedia)) {
    for (const lang of ['en', 'vi']) assert.doesNotMatch(`${alt[lang]} ${caption[lang]}`, /organic|hữu cơ|certif|chứng nhận/i);
  }
});

// The production build must not need the untracked originals: the data imports WebP derivatives only, each present on disk
// and tracked by Git, so a clean checkout has them.
test('every image the pages import is a tracked WebP derivative; no original is imported', () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const imports = [...fs.readFileSync(path.join(import.meta.dirname, 'passionFruitMedia.js'), 'utf8').matchAll(/from '@\/assets\/(passion-fruit\/[^']+)'/g)].map(m => m[1]);
  assert.ok(imports.length >= 16);
  for (const file of imports) {
    assert.match(file, /^passion-fruit\/production\/(shared\/(product|farming|operations|packaging)|foodservice|retail)\/[a-z0-9-]+\.webp$/, file);
    const relative = `src/assets/${file}`;
    assert.ok(fs.existsSync(path.join(root, relative)), `${relative} exists`);
    assert.equal(execFileSync('git', ['ls-files', relative], { cwd: root }).toString().trim(), relative, `${relative} is tracked`);
  }
});

test('nothing in the source tree reaches into the private originals, and no loose image is left in the passion fruit folder root', () => {
  const root = path.resolve(import.meta.dirname, '../..');
  const files = fs.readdirSync(path.join(root, 'src'), { recursive: true }).filter(f => /\.(jsx?|tsx?|css)$/.test(f));
  assert.ok(files.length > 100);
  const stale = files.filter(f => /passion-fruit\/(private-sources|[^/'"]+\.(webp|png|jpe?g))/i.test(fs.readFileSync(path.join(root, 'src', f), 'utf8')));
  assert.deepEqual(stale, []);
  const folder = path.join(root, 'src/assets/passion-fruit');
  assert.deepEqual(fs.readdirSync(folder, { withFileTypes: true }).filter(e => e.isFile()).map(e => e.name), []);
});
