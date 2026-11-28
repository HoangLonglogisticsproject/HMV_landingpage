// Web derivatives of the golden passion fruit photographs HMV supplied. The site imports only the WebP files this script writes
// into src/assets/passion-fruit/production/ (tracked in Git, so a clean checkout and CI build without the originals). The
// originals (JPG and PNG, up to 3 MB each) stay in src/assets/passion-fruit/private-sources/ as supplied: ignored by Git, refused
// by scripts/check-protected-assets.js, and needed only to run this script. Nothing under private-sources/ is ever committed.
//
//   node scripts/passion-fruit-images.mjs            every derivative (needs every original)
//   node scripts/passion-fruit-images.mjs signature-drinks premium-packaging   only those (by output name)
//
// private-sources/  farming/ operations/ product/ (V1 photographs)   v2-media/ (V2 marketing concepts, AI-generated)
// production/       shared/{product,farming,operations,packaging}/ (Export, Foodservice and Retail)   foodservice/   retail/
//
// Sources are found by their file name without the extension (Unicode-normalized, so `chanh dây organic` is the same
// whether the file system stores it composed or decomposed, JPG or PNG). Output: ASCII names, WebP quality 80, no
// metadata, never enlarged, colors untouched. The crop boxes are publication decisions, in pixels of the source: they
// leave out third-party packaging text, supplier signage and identifiable faces (docs/architecture/PASSION_FRUIT.md).
// A photograph with no row here is withheld from the site. The V1 derivatives are committed and approved by content: do not
// regenerate them only to move them (a new sharp or libwebp build would change their bytes and their manifest ids).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../src/assets/passion-fruit');
const SOURCES = path.join(ROOT, 'private-sources');
const PRODUCTION = path.join(ROOT, 'production');
const IMAGE = /\.(jpe?g|png)$/i;

/** The original whose name, without its extension, is `stem`, in the private-sources folder `group`. */
function source(group, stem) {
  const dir = path.join(SOURCES, group);
  const wanted = stem.normalize('NFC');
  const match = fs.existsSync(dir) && fs.readdirSync(dir).find(file => IMAGE.test(file) && path.parse(file).name.normalize('NFC') === wanted);
  if (!match) throw new Error(`No original named "${stem}" (.jpg or .png) in ${dir}`);
  return path.join(dir, match);
}

// PF-04 (edited product image, 1254×1254): golden fruit in nets, a carton and a display stand under a fruiting vine.
// PF-05 (edited, 1086×1448): a twelve-compartment carton. PF-10 (edited, 1448×1086): neutral cartons, no marking.
// PF-06, PF-07, PF-08: the documentary photographs of the vine, the sorted fruit and the trellis.
/** @type {{ dir: string, out: string, group: string, from: string, box?: { left: number, top: number, width: number, height: number } }[]} */
const DERIVATIVES = [
  { dir: 'shared/product', out: 'golden-fruit-scene', group: 'product', from: 'chanh day 2' },
  { dir: 'shared/product', out: 'golden-fruit-display', group: 'product', from: 'chanh day 2', box: { left: 0, top: 540, width: 1120, height: 714 } },
  { dir: 'shared/product', out: 'golden-fruit-on-tree', group: 'product', from: 'chanh day 2', box: { left: 0, top: 0, width: 1254, height: 560 } },
  { dir: 'shared/product', out: 'golden-fruit-pile', group: 'product', from: 'chanh day 2', box: { left: 480, top: 880, width: 640, height: 374 } },
  { dir: 'shared/product', out: 'golden-fruit-halved', group: 'product', from: 'chanh day 2', box: { left: 540, top: 640, width: 540, height: 260 } },
  { dir: 'shared/product', out: 'golden-fruit-cluster', group: 'product', from: 'chanh day 2', box: { left: 480, top: 620, width: 640, height: 634 } },
  { dir: 'shared/packaging', out: 'fruit-protective-nets', group: 'product', from: 'chanh day 2', box: { left: 520, top: 540, width: 600, height: 600 } },
  { dir: 'shared/packaging', out: 'carton-twelve-compartments', group: 'product', from: 'chanh day 4' },
  { dir: 'shared/packaging', out: 'neutral-packaging-cartons', group: 'product', from: 'hữu cơ 1' },
  { dir: 'shared/packaging', out: 'neutral-carton-fruit', group: 'product', from: 'hữu cơ 1', box: { left: 640, top: 330, width: 808, height: 570 } },
  { dir: 'shared/farming', out: 'vine-green-fruit', group: 'farming', from: 'chanh dây farming 2' },
  // PF-07: the sorted fruit on the tarpaulin only: no person, hand or background is in the frame (the workers' consent is pending).
  { dir: 'shared/operations', out: 'manual-sorting', group: 'operations', from: 'chanh dây organic', box: { left: 560, top: 570, width: 720, height: 390 } },
  { dir: 'shared/farming', out: 'orchard-trellis', group: 'farming', from: 'chanh dây tại farm' },
  // V2 (1448×1086 AI-generated marketing concepts, golden-yellow fruit, no text or marks): application and packaging illustrations,
  // not photographs of HMV, a customer, a finished product or manufactured packaging. Native size, not enlarged.
  { dir: 'foodservice', out: 'signature-drinks', group: 'v2-media', from: 'signature-drinks' },
  { dir: 'foodservice', out: 'luxury-culinary', group: 'v2-media', from: 'luxury-culinary' },
  { dir: 'retail', out: 'premium-packaging', group: 'v2-media', from: 'retail-presentation' },
];

const only = process.argv.slice(2);
for (const { dir, out, group, from, box } of DERIVATIVES.filter(d => !only.length || only.includes(d.out))) {
  const image = sharp(source(group, from));
  const target = path.join(PRODUCTION, dir);
  fs.mkdirSync(target, { recursive: true });
  const info = await (box ? image.extract(box) : image).webp({ quality: 80 }).toFile(path.join(target, `${out}.webp`));
  console.log(`${dir}/${out}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)} KB  <- ${group}/${from}`);
}
