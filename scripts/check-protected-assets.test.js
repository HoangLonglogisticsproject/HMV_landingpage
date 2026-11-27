import { test } from 'vitest';
import assert from 'node:assert/strict';
import { findViolations } from './check-protected-assets.js';

test('the approved public assets and the visual baselines pass', () => {
  assert.deepEqual(findViolations([
    'public/favicon.png', 'public/og-image.jpg', 'src/assets/favicon.png', 'src/assets/golden-fruit-scene.webp',
    'src/assets/passion-fruit/orchard-trellis.webp', 'tests/next-visual/visual.spec.js-snapshots/en-home-chromium-desktop-linux.png',
    'docs/architecture/PASSION_FRUIT.md', 'public/llms.txt', 'src/data/passionFruitPages.js',
  ]), []);
});

test('source photographs are refused wherever they are, whatever the extension case', () => {
  for (const file of [
    'src/assets/passion-fruit/source photo.jpg', 'src/assets/products/original.JPG', 'src/assets/anything.png', 'src/assets/passion-fruit/x.jpeg',
    'src/assets/x.heic', 'public/photo.png', 'docs/architecture/figure.png', 'tests/screenshots/home.png', 'tests/next-visual/other-folder/x.png',
    'scripts/original.tif', 'src/assets/ảnh vùng trồng.jpg',
  ]) assert.equal(findViolations([file]).length, 1, file);
});

test('private design references, supplier and customer papers and archives are refused', () => {
  for (const file of [
    'specs/references/mockup.png', 'specs/references/notes.md', 'private/anything.txt', 'internal/prices.csv', 'suppliers/list.txt', 'supplier/list.txt',
    'docs/quotation.pdf', 'docs/contract.docx', 'data/prices.xlsx', 'data/customers.csv', 'backup.zip', 'mail.eml',
    'docs/supplier-quotes.tar.gz', 'docs/quotes.tar', 'docs/quotes.tgz', 'docs/quotes.tar.bz2', 'docs/quotes.tar.xz', 'data/dump.gz', 'data/dump.zst', 'media.iso',
  ]) assert.equal(findViolations([file]).length, 1, file);
});

test('each violation says what to do about it, and a clean tree reports none', () => {
  const [message] = findViolations(['src/assets/x.jpg']);
  assert.match(message, /^src\/assets\/x\.jpg: /);
  assert.deepEqual(findViolations([]), []);
});
