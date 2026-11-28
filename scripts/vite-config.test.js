import { test } from 'vitest';
import assert from 'node:assert/strict';
import picomatch from 'picomatch';
import config from '../vite.config.js';

const matches = (patterns, file) => patterns.some(pattern => picomatch(pattern, { dot: true })(file));
const { watch, fs, proxy } = config.server;

test('the dev server does not watch unfinished browser downloads or the private media (Windows EBUSY on a locked .crdownload)', () => {
  for (const file of [
    'D:/p/src/assets/passion-fruit/production/foodservice/Unconfirmed 235061.crdownload', 'src/a/b.webp.crdownload', 'src/a/b.png.part', 'src/a/b.jpg.download',
    'src/assets/passion-fruit/private-sources/v2-media/x.png', 'src/assets/passion-fruit/private-sources/farming/ảnh vùng trồng.jpg', 'specs/references/mockup.png',
  ]) assert.ok(matches(watch.ignored, file), file);
  // Legitimate sources stay watched: HMR and the production derivatives.
  for (const file of ['src/views/products/passion-fruit/FoodserviceSegment.jsx', 'src/assets/passion-fruit/production/foodservice/foodservice-hero.webp', 'src/data/passionFruitPages.js', 'docs/download-guide.md'])
    assert.ok(!matches(watch.ignored, file), file);
});

test('the dev server refuses to serve the private media, and keeps Vite\'s own sensitive-file defaults', () => {
  for (const file of ['src/assets/passion-fruit/private-sources/v2-media/x.png', 'specs/references/mockup.png', '.env', '.env.local', 'key.pem', '.git/config'])
    assert.ok(matches(fs.deny, file), file);
  assert.ok(!matches(fs.deny, 'src/assets/passion-fruit/production/retail/premium-packaging.webp'));
});

test('the CMS proxy, polling and HMR settings are untouched', () => {
  assert.deepEqual(Object.keys(proxy), ['/api/v1/public']);
  assert.equal(proxy['/api/v1/public'].changeOrigin, true);
  assert.equal(watch.usePolling, undefined);
  assert.equal(config.server.hmr, undefined);
});
