// Web derivatives of the golden passion fruit photographs HMV supplied (src/assets/passion-fruit/). The site imports only
// the WebP files this script writes (tracked in Git, so a clean checkout builds without the originals); the originals
// (JPG and PNG, up to 3 MB each) are kept in that folder as supplied, untracked, and are needed only to run this script.
//
//   node scripts/passion-fruit-images.mjs
//
// Sources are found by their file name without the extension (Unicode-normalized, so `chanh dây organic` is the same
// whether the file system stores it composed or decomposed, JPG or PNG). Output: ASCII names, WebP quality 80, no
// metadata, never enlarged, colors untouched. The crop boxes are publication decisions, in pixels of the source: they
// leave out third-party packaging text, supplier signage and identifiable faces (docs/architecture/PASSION_FRUIT.md).
// A photograph with no row here is withheld from the site.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const DIR = path.resolve(import.meta.dirname, '../src/assets/passion-fruit');
const IMAGE = /\.(jpe?g|png)$/i;

/** The original whose name, without its extension, is `stem`. */
function source(stem) {
  const wanted = stem.normalize('NFC');
  const match = fs.readdirSync(DIR).find(file => IMAGE.test(file) && path.parse(file).name.normalize('NFC') === wanted);
  if (!match) throw new Error(`No original named "${stem}" (.jpg or .png) in ${DIR}`);
  return path.join(DIR, match);
}

// PF-04 (edited product image, 1254×1254): golden fruit in nets, a carton and a display stand under a fruiting vine.
// PF-05 (edited, 1086×1448): a twelve-compartment carton. PF-10 (edited, 1448×1086): neutral cartons, no marking.
// PF-06, PF-07, PF-08: the documentary photographs of the vine, the sorted fruit and the trellis.
/** @type {{ out: string, from: string, box?: { left: number, top: number, width: number, height: number } }[]} */
const DERIVATIVES = [
  { out: 'golden-fruit-scene', from: 'chanh day 2' },
  { out: 'golden-fruit-display', from: 'chanh day 2', box: { left: 0, top: 540, width: 1120, height: 714 } },
  { out: 'golden-fruit-on-tree', from: 'chanh day 2', box: { left: 0, top: 0, width: 1254, height: 560 } },
  { out: 'golden-fruit-pile', from: 'chanh day 2', box: { left: 480, top: 880, width: 640, height: 374 } },
  { out: 'golden-fruit-halved', from: 'chanh day 2', box: { left: 540, top: 640, width: 540, height: 260 } },
  { out: 'golden-fruit-cluster', from: 'chanh day 2', box: { left: 480, top: 620, width: 640, height: 634 } },
  { out: 'fruit-protective-nets', from: 'chanh day 2', box: { left: 520, top: 540, width: 600, height: 600 } },
  { out: 'carton-twelve-compartments', from: 'chanh day 4' },
  { out: 'neutral-packaging-cartons', from: 'hữu cơ 1' },
  { out: 'neutral-carton-fruit', from: 'hữu cơ 1', box: { left: 640, top: 330, width: 808, height: 570 } },
  { out: 'vine-green-fruit', from: 'chanh dây farming 2' },
  // PF-07: the sorted fruit on the tarpaulin only: no person, hand or background is in the frame (the workers' consent is pending).
  { out: 'manual-sorting', from: 'chanh dây organic', box: { left: 560, top: 570, width: 720, height: 390 } },
  { out: 'orchard-trellis', from: 'chanh dây tại farm' },
];

for (const { out, from, box } of DERIVATIVES) {
  const image = sharp(source(from));
  const info = await (box ? image.extract(box) : image).webp({ quality: 80 }).toFile(path.join(DIR, `${out}.webp`));
  console.log(`${out}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB  <- ${from}`);
}
