// Keeps supplier-sensitive and private media out of this public repository (AGENTS.md, "Supplier confidentiality"). Run by
// `npm run lint` over the files Git tracks, which includes whatever is staged, so a commit that adds one fails before it is
// made; tested by check-protected-assets.test.js.
//
// An allowlist, not a ban on images: the site's photographs are WebP derivatives (`scripts/*-images.mjs`), and these are the
// only other raster files the repository carries. A new approved public raster file is added to ALLOWED in a reviewed change.
//   - the visual regression baselines (Playwright's `*-snapshots/` PNGs under tests/);
//   - the favicon and the Open Graph image.
// Everything else that is a photograph or a supplier or customer document is refused: source photographs (JPG, PNG, HEIC,
// TIFF…), private design references, and office, PDF, archive or mail files. Those stay on the machine; `.gitignore` also
// lists the source folders so `git add` skips them.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const RASTER = /\.(jpe?g|png|gif|bmp|tiff?|heic|heif|raw|dng|cr2|nef)$/i;
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|csv|odt|ods|eml|msg|zip|rar|7z|tar|tgz|gz|bz2|tbz2?|xz|txz|zst|lz4|iso|dmg)$/i;
const ALLOWED = [
  /^tests\/next-visual\/[^/]+-snapshots\/[^/]+\.png$/,
  /^public\/(favicon\.png|og-image\.jpg)$/,
  /^src\/assets\/favicon\.png$/,
];
// Folders that hold private source material or design references: nothing in them is committed, whatever the extension.
const PRIVATE_DIRS = [/^specs\/references\//, /^private\//, /^internal\//, /^suppliers?\//];

/** @param {string[]} files repository paths, as `git ls-files` prints them */
export function findViolations(files) {
  const violations = [];
  for (const file of files) {
    if (PRIVATE_DIRS.some(dir => dir.test(file))) violations.push(`${file}: a private folder (design references, internal or supplier material)`);
    else if (DOCUMENT.test(file)) violations.push(`${file}: a document or archive (supplier, customer or internal papers are not committed)`);
    else if (RASTER.test(file) && !ALLOWED.some(rule => rule.test(file))) violations.push(`${file}: a photograph or image that is not an approved public asset`);
  }
  return violations;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, '..');
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, maxBuffer: 64 * 1024 * 1024 }).toString().split('\0').filter(Boolean)
    // Names with accents come back quoted-free with -z, as written.
    .map(file => file.normalize('NFC'));
  const violations = findViolations(files);
  if (violations.length) {
    console.error(`Protected assets (scripts/check-protected-assets.js):\n  ${violations.join('\n  ')}\n`
      + 'Source photographs and private papers stay local: unstage them (git rm --cached <file>) and commit only the sanitized WebP derivatives. See AGENTS.md, "Supplier confidentiality".');
    process.exit(1);
  }
  console.log('Protected assets: OK');
}
