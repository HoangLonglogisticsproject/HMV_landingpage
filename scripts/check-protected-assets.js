// Keeps supplier-sensitive and private media out of this public repository (AGENTS.md, "Supplier confidentiality").
// Run by `npm run lint` over the index (what Git tracks, which includes what is staged), by `.githooks/pre-commit` before a
// commit, and by `.githooks/pre-push` over the commits about to be pushed (`--rev <commit>`); tested by
// check-protected-assets.test.js.
//
// A preventive control, not a review. It cannot tell whether an image is sanitized: a person has to look at every image
// that is added (supplier names, logos, telephone numbers, e-mail and web addresses, QR codes, barcodes, labels, documents,
// faces, metadata) and approve it by adding it to scripts/approved-assets.json, in a reviewed change. The rules:
//   1. Every tracked image file (any format: JPG, PNG, WebP, AVIF, HEIC, TIFF, SVG...) must be in that manifest, by path
//      AND by Git blob id, so an unreviewed file, and an approved name with other content, both fail. The only exception
//      is the Playwright baselines of the visual tests (`*-snapshots/*.png`), which are screenshots of the site.
//   2. Private folders (design references, internal and supplier material, src/assets/passion-fruit/private-sources/) hold nothing,
//      whatever the extension, the name or the manifest.
//   3. Supplier and customer papers, design sources and archives (PDF, office, CSV, PSD, ZIP, TAR.GZ...) are refused.
//   4. Unfinished browser downloads (.crdownload, .part, .download) are refused: not an asset in any state.
//   5. A manifest entry for a file that is no longer tracked is stale and fails, so the manifest stays the truth.
// A file name can itself be sensitive: where CI logs are public (`CI` is set) a violation names the folder, the extension and
// a short identifier of the path, not the file name; run the check locally for the name.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const IMAGE = /\.(jpe?g|png|gif|bmp|tiff?|heic|heif|avif|webp|jxl|apng|ico|svg|raw|dng|cr2|nef|arw)$/i;
const DOCUMENT = /\.(pdf|docx?|xlsx?|pptx?|csv|odt|ods|eml|msg|psd|ai|indd|sketch|fig|xd|zip|rar|7z|tar|tgz|gz|bz2|tbz2?|xz|txz|zst|lz4|iso|dmg)$/i;
// Screenshots of the site made by the visual tests: reviewed as a diff of the pages, not as source media.
const BASELINE = /^tests\/next-visual\/[^/]+-snapshots\/[^/]+\.png$/;
// Folders that hold private source material or design references: nothing in them is committed, whatever the extension.
// `private-sources/` holds the local originals of the golden passion fruit pages; it is matched at any depth and in any letter case
// (case-insensitive file systems), before the manifest is consulted, so no approval can ever admit a file in it.
const PRIVATE_DIRS = [/^specs\/references\//, /^private\//, /^internal\//, /^suppliers?\//, /^src\/assets\/passion-fruit\/private-sources\//i];

// An incomplete download: neither a reviewed image nor a document, and never approvable.
const PARTIAL_DOWNLOAD = /\.(crdownload|part|download)$/i;

const MANIFEST_PATH = 'scripts/approved-assets.json';

/** A short, stable identifier of a path, for logs that must not show the name. */
const shortId = file => createHash('sha1').update(file).digest('hex').slice(0, 8);

/** How a violation names a file: the whole path, or (redacted) its folder, an identifier of the path and its extension. */
function label(file, redact) {
  if (!redact) return file;
  const dir = path.posix.dirname(file);
  const folder = dir === '.' ? '' : `${dir}/`;
  return `${folder}<file ${shortId(file)}>${path.posix.extname(file).toLowerCase()}`;
}

/**
 * @param {string[]} files tracked paths, as `git ls-files` prints them
 * @param {{ manifest?: Record<string, string>, ids?: Record<string, string>, redact?: boolean }} [options]
 *   `manifest`: path → Git blob id of every approved image; `ids`: path → blob id of the tracked files; `redact`: no file names
 */
export function findViolations(files, { manifest = {}, ids = {}, redact = false } = {}) {
  const violations = [];
  const tracked = new Set(files);
  for (const file of files) {
    const name = label(file, redact);
    if (PRIVATE_DIRS.some(dir => dir.test(file))) violations.push(`${name}: a private folder (design references, internal or supplier material)`);
    else if (PARTIAL_DOWNLOAD.test(file)) violations.push(`${name}: an unfinished browser download (not committed; finish or delete it)`);
    else if (DOCUMENT.test(file)) violations.push(`${name}: a document, design source or archive (supplier, customer or internal papers are not committed)`);
    else if (IMAGE.test(file) && !BASELINE.test(file)) {
      if (!Object.hasOwn(manifest, file)) violations.push(`${name}: an image that is not in the approved-asset manifest (scripts/approved-assets.json); review it, then approve it there`);
      else if (ids[file] !== undefined && manifest[file] !== ids[file]) violations.push(`${name}: an approved image whose content changed since its approval (scripts/approved-assets.json)`);
    }
  }
  for (const file of Object.keys(manifest)) {
    if (!tracked.has(file)) violations.push(`${label(file, redact)}: in the approved-asset manifest but not tracked (remove the entry)`);
  }
  return violations;
}

/** Tracked paths and their blob ids: from the index, or from a commit's tree (`rev`). */
export function readTracked(root, rev) {
  const raw = rev
    ? execFileSync('git', ['ls-tree', '-r', '-z', rev], { cwd: root, maxBuffer: 256 * 1024 * 1024 }).toString()
    : execFileSync('git', ['ls-files', '-s', '-z'], { cwd: root, maxBuffer: 256 * 1024 * 1024 }).toString();
  const ids = {};
  for (const entry of raw.split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t');
    const [, a, b] = entry.slice(0, tab).split(' ');
    // `ls-files -s`: mode id stage; `ls-tree`: mode type id.
    ids[entry.slice(tab + 1).normalize('NFC')] = rev ? b : a;
  }
  return { files: Object.keys(ids), ids };
}

/**
 * The approvals of the snapshot being checked: the index's manifest, or the commit's (`rev`), never the working tree's. An image
 * staged with its approval left unstaged, or an unrelated edit of the file on disk, changes nothing about what is checked.
 * A snapshot without a manifest approves nothing.
 * @returns {Record<string, string>}
 */
export function readManifest(root, rev) {
  try {
    return JSON.parse(execFileSync('git', ['show', `${rev ?? ''}:${MANIFEST_PATH}`], { cwd: root, stdio: 'pipe' }).toString()).assets ?? {};
  } catch {
    return {};
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = path.resolve(import.meta.dirname, '..');
  const args = process.argv.slice(2);
  const rev = args.includes('--rev') ? args[args.indexOf('--rev') + 1] : undefined;
  const where = rev ? ` at ${rev.slice(0, 12)}` : '';
  const { files, ids } = readTracked(root, rev);
  const manifest = readManifest(root, rev);
  if (args.includes('--manifest')) {
    // For the reviewer: the entries a reviewed change would add. Prints; never writes.
    const missing = files.filter(file => IMAGE.test(file) && !BASELINE.test(file) && manifest[file] !== ids[file]);
    console.log(JSON.stringify(Object.fromEntries(missing.sort().map(file => [file, ids[file]])), null, 2));
  } else {
    const violations = findViolations(files, { manifest, ids, redact: Boolean(process.env.CI) });
    if (violations.length) {
      console.error(`Protected assets (scripts/check-protected-assets.js${where}):\n  ${violations.join('\n  ')}\n`
        + 'Source photographs, private design references and supplier or customer papers stay local: unstage them (git rm --cached <file>). '
        + 'A new public image is reviewed by a person first, then added to scripts/approved-assets.json. See AGENTS.md, "Supplier confidentiality".');
      process.exit(1);
    }
    console.log(`Protected assets: OK (${files.length} tracked files${where})`);
  }
}
