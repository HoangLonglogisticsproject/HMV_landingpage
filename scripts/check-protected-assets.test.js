import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
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

test('everything under passion-fruit/private-sources is refused: any depth, extension, letter case and manifest entry', () => {
  const root = 'src/assets/passion-fruit/private-sources';
  const files = [
    `${root}/farming/ảnh vùng trồng.jpg`, `${root}/operations/chanh dây organic.jpg`, `${root}/product/chanh day 2.png`, `${root}/v2-media/signature-drinks.png`,
    `${root}/v2-media/signature-drinks.webp`, `${root}/v2-media/notes.txt`, `${root}/README`, `${root}/a/b/c/d/deep.avif`, `${root}/quote.pdf`,
    'src/assets/Passion-Fruit/Private-Sources/x.webp', 'src/assets/passion-fruit/PRIVATE-SOURCES/x.md',
  ];
  for (const file of files) assert.equal(check([file]).length, 1, file);
  // An approval, even one with the right blob id, does not admit it.
  for (const file of files) assert.equal(findViolations([file], { manifest: { [file]: 'x' }, ids: { [file]: 'x' } }).length, 1, file);
  // The production folders next to it are not private.
  assert.deepEqual(findViolations(['src/assets/passion-fruit/production/retail/x.webp'], { manifest: { 'src/assets/passion-fruit/production/retail/x.webp': 'x' } }), []);
});

test('a force-added file inside private-sources is refused in the index and in a commit', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'protected-private-'));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, stdio: 'pipe' }).toString();
  try {
    git('init', '-q');
    mkdirSync(path.join(dir, 'src/assets/passion-fruit/private-sources/v2-media'), { recursive: true });
    writeFileSync(path.join(dir, '.gitignore'), '/src/assets/passion-fruit/private-sources/\n');
    writeFileSync(path.join(dir, 'src/assets/passion-fruit/private-sources/v2-media/concept.png'), 'private bytes');
    git('add', '-A');
    assert.deepEqual(readTracked(dir).files, ['.gitignore'], 'the ignore rule keeps it out of git add -A');
    git('add', '-f', 'src/assets/passion-fruit/private-sources/v2-media/concept.png');
    const staged = readTracked(dir);
    const file = 'src/assets/passion-fruit/private-sources/v2-media/concept.png';
    // Approved by path and blob id, it is still refused.
    assert.equal(findViolations(staged.files, { manifest: { [file]: staged.ids[file] }, ids: staged.ids }).length, 1);
    git('commit', '-q', '-m', 'x');
    const committed = readTracked(dir, 'HEAD');
    assert.equal(findViolations(committed.files, { manifest: { [file]: committed.ids[file] }, ids: committed.ids }).length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
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
  assert.deepEqual(findViolations(files, { manifest: readManifest(root), ids }), []);
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

test('the approvals are those of the snapshot checked: an unstaged edit of the manifest approves nothing that is staged', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'protected-manifest-'));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd: dir, stdio: 'pipe' }).toString();
  const manifestFile = path.join(dir, 'scripts/approved-assets.json');
  try {
    git('init', '-q');
    mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    mkdirSync(path.join(dir, 'src/assets'), { recursive: true });
    writeFileSync(manifestFile, JSON.stringify({ assets: {} }));
    git('add', 'scripts');
    git('commit', '-q', '-m', 'manifest');
    // The image is staged; its approval is only in the working tree.
    writeFileSync(path.join(dir, 'src/assets/new.avif'), 'unreviewed bytes');
    git('add', 'src/assets/new.avif');
    const { files, ids } = readTracked(dir);
    writeFileSync(manifestFile, JSON.stringify({ assets: { 'src/assets/new.avif': ids['src/assets/new.avif'] } }));
    assert.deepEqual(readManifest(dir), {});
    assert.equal(findViolations(files, { manifest: readManifest(dir), ids }).length, 1);
    // Staged together, the approval counts, in the index and in the commit that follows.
    git('add', 'scripts/approved-assets.json');
    assert.equal(findViolations(files, { manifest: readManifest(dir), ids }).length, 0);
    git('commit', '-q', '-m', 'image and approval');
    const committed = readTracked(dir, 'HEAD');
    assert.deepEqual(findViolations(committed.files, { manifest: readManifest(dir, 'HEAD'), ids: committed.ids }), []);
    // The earlier commit holds the manifest without it: that snapshot has no approval, whatever the disk says.
    assert.deepEqual(readManifest(dir, 'HEAD~1'), {});
    // A snapshot without a manifest approves nothing.
    assert.deepEqual(readManifest(dir, '4b825dc642cb6eb9a060e54bf8d69288fbee4904'), {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the pre-push hook checks every commit a push publishes: a file added in one commit and removed in the next is refused', () => {
  const root = path.resolve(import.meta.dirname, '..');
  const dir = mkdtempSync(path.join(tmpdir(), 'protected-push-'));
  const remote = path.join(dir, 'remote.git');
  const work = path.join(dir, 'work');
  const run = (cwd, ...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args], { cwd, stdio: 'pipe' }).toString();
  try {
    mkdirSync(work, { recursive: true });
    run(dir, 'init', '-q', '--bare', remote);
    run(work, 'init', '-q', '-b', 'main');
    mkdirSync(path.join(work, 'scripts'), { recursive: true });
    mkdirSync(path.join(work, '.githooks'), { recursive: true });
    copyFileSync(path.join(root, 'scripts/check-protected-assets.js'), path.join(work, 'scripts/check-protected-assets.js'));
    copyFileSync(path.join(root, '.githooks/pre-push'), path.join(work, '.githooks/pre-push'));
    writeFileSync(path.join(work, 'package.json'), '{"type":"module"}');
    writeFileSync(path.join(work, 'scripts/approved-assets.json'), '{"assets":{}}');
    run(work, 'config', 'core.hooksPath', '.githooks');
    run(work, 'remote', 'add', 'origin', remote);
    run(work, 'add', '-A');
    run(work, 'commit', '-q', '-m', 'base');
    run(work, 'push', '-q', 'origin', 'main');
    // A clean commit is published.
    writeFileSync(path.join(work, 'notes.md'), 'notes');
    run(work, 'add', 'notes.md');
    run(work, 'commit', '-q', '-m', 'clean');
    run(work, 'push', '-q', 'origin', 'main');
    // A adds a supplier document, B removes it: the tip is clean, the history is not.
    writeFileSync(path.join(work, 'quotation.pdf'), 'confidential');
    run(work, 'add', 'quotation.pdf');
    run(work, 'commit', '-q', '-m', 'A');
    run(work, 'rm', '-q', 'quotation.pdf');
    run(work, 'commit', '-q', '-m', 'B');
    assert.equal(execFileSync('node', ['scripts/check-protected-assets.js'], { cwd: work, stdio: 'pipe' }).toString().includes('OK'), true);
    assert.throws(() => run(work, 'push', 'origin', 'main'));
    assert.equal(run(remote, 'rev-list', '--count', 'main').trim(), '2');
    // A new branch is checked the same way, and a branch without such a commit is published.
    assert.throws(() => run(work, 'push', 'origin', 'main:refs/heads/other'));
    run(work, 'checkout', '-q', '-b', 'clean-branch', 'HEAD~2');
    run(work, 'push', '-q', 'origin', 'clean-branch');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}, 60_000);
