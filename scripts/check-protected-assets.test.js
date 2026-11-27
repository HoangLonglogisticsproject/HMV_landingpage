import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { findViolations, readManifest, readTracked } from './check-protected-assets.js';

const APPROVED = {
  'public/favicon.png': 'a1', 'public/og-image.jpg': 'a2', 'src/assets/favicon.png': 'a3',
  'src/assets/golden-fruit-scene.webp': 'a4', 'src/assets/passion-fruit/orchard-trellis.webp': 'a5',
};
const BASELINE = 'tests/next-visual/visual.spec.js-snapshots/en-home-chromium-desktop-linux.png';
// The approved files are always tracked here, so only the files under test can be violations (no stale entries).
const check = (files, extra = {}) => findViolations([...files, ...Object.keys(APPROVED)], { manifest: APPROVED, ...extra });

test('the approved public assets, the visual baselines and ordinary files pass', () => {
  assert.deepEqual(check([
    ...Object.keys(APPROVED), BASELINE, 'docs/architecture/PASSION_FRUIT.md', 'public/llms.txt', 'src/data/passionFruitPages.js',
  ]), []);
});

test('an image that is not in the manifest is refused, in every format and letter case', () => {
  for (const file of [
    'src/assets/passion-fruit/new.webp', 'src/assets/passion-fruit/new.WEBP', 'src/assets/new.avif', 'src/assets/new.AVIF', 'src/assets/new.Avif',
    'src/assets/new.jxl', 'src/assets/new.heic', 'src/assets/new.HEIF', 'src/assets/new.jpg', 'src/assets/new.JPG', 'src/assets/new.jpeg', 'src/assets/new.png',
    'src/assets/new.gif', 'src/assets/new.bmp', 'src/assets/new.tif', 'src/assets/new.TIFF', 'src/assets/new.svg', 'src/assets/new.ico', 'src/assets/new.apng',
    'src/assets/new.dng', 'src/assets/new.cr2', 'src/assets/ảnh vùng trồng.jpg', 'docs/architecture/figure.png', 'tests/screenshots/home.png',
    'tests/next-visual/other-folder/x.png', 'tests/next-visual/visual.spec.js-snapshots/nested/x.png', 'public/photo.png', 'scripts/original.tif',
  ]) assert.equal(check([file]).length, 1, file);
});

test('an approved name with other content is refused, and an entry for a file that is gone is stale', () => {
  const same = { 'public/favicon.png': 'a1' };
  assert.deepEqual(findViolations(['public/favicon.png'], { manifest: same, ids: same }), []);
  assert.equal(findViolations(['public/favicon.png'], { manifest: same, ids: { 'public/favicon.png': 'other' } }).length, 1);
  assert.equal(findViolations([], { manifest: same }).length, 1);
});

test('names that exist on the Object prototype are not approved by inheritance', () => {
  for (const file of ['constructor.webp', '__proto__.avif', 'toString.png', 'hasOwnProperty.jpg']) assert.equal(check([file]).length, 1, file);
});

test('private design references, supplier and customer papers and archives are refused', () => {
  for (const file of [
    'specs/references/mockup.png', 'specs/references/notes.md', 'private/anything.txt', 'internal/prices.csv', 'suppliers/list.txt', 'supplier/list.txt',
    'docs/quotation.pdf', 'docs/contract.docx', 'data/prices.xlsx', 'data/customers.csv', 'backup.zip', 'mail.eml', 'BACKUP.ZIP',
    'docs/supplier-quotes.tar.gz', 'docs/quotes.tar', 'docs/quotes.tgz', 'docs/quotes.tar.bz2', 'docs/quotes.tar.xz', 'data/dump.gz', 'data/dump.zst', 'media.iso',
  ]) assert.equal(check([file]).length, 1, file);
});

test('a violation names what to do about it; redacted for public logs it shows no file name', () => {
  const [message] = check(['src/assets/x.jpg']);
  assert.match(message, /^src\/assets\/x\.jpg: /);
  const secret = 'src/assets/passion-fruit/Acme Farms Co price list.AVIF';
  const [redacted] = check([secret], { redact: true });
  assert.match(redacted, /^src\/assets\/passion-fruit\/<file [0-9a-f]{8}>\.avif: /);
  assert.ok(!/Acme|price/i.test(redacted));
  assert.ok(!/Acme/.test(check(['specs/references/Acme.png', 'docs/Acme quote.pdf', 'src/assets/Acme.png'], { redact: true }).join(' ')));
  assert.deepEqual(check([]), []);
});

test('the committed manifest covers exactly the tracked images, and is checked against the real index', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const { files, ids } = readTracked(root);
  assert.deepEqual(findViolations(files, { manifest: readManifest(), ids }), []);
});

test('against a real Git repository: the index and a commit are both checked, a staged AVIF fails before it is committed', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'protected-assets-'));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, stdio: 'pipe' }).toString();
  try {
    git('init', '-q');
    mkdirSync(path.join(dir, 'src/assets'), { recursive: true });
    writeFileSync(path.join(dir, 'src/assets/ok.webp'), 'approved bytes');
    writeFileSync(path.join(dir, 'src/assets/new.AVIF'), 'unreviewed bytes');
    git('add', '-A');
    const { files, ids } = readTracked(dir);
    assert.deepEqual(files.sort(), ['src/assets/new.AVIF', 'src/assets/ok.webp']);
    const manifest = { 'src/assets/ok.webp': ids['src/assets/ok.webp'] };
    assert.equal(findViolations(files, { manifest, ids }).length, 1);
    git('commit', '-q', '-m', 'x');
    const committed = readTracked(dir, 'HEAD');
    assert.deepEqual(committed.ids, ids);
    assert.equal(findViolations(committed.files, { manifest, ids: committed.ids }).length, 1);
    writeFileSync(path.join(dir, 'src/assets/ok.webp'), 'swapped bytes');
    git('add', '-A');
    const swapped = readTracked(dir);
    assert.equal(findViolations(swapped.files, { manifest: { ...manifest, 'src/assets/new.AVIF': ids['src/assets/new.AVIF'] }, ids: swapped.ids }).length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
