// Image quality review (architecture §11): each WebP in src/assets against its original from a git commit, resized
// to the WebP's dimensions, as SSIM (luma, 8×8 windows, stride 4) and PSNR (RGB). Resolution and aspect ratio are
// tested in the browser by tests/next/images.spec.js; this measures what the re-encoding costs.
// Usage: node scripts/image-fidelity.mjs <commit holding the originals, e.g. f10daaa>
// Uses sharp, which next installs for its image optimizer.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ref = process.argv[2];
if (!ref) throw new Error('Usage: node scripts/image-fidelity.mjs <commit>');
const MIN_SSIM = 0.95;

const files = dir => readdirSync(dir).flatMap(f => (statSync(path.join(dir, f)).isDirectory() ? files(path.join(dir, f)) : [path.join(dir, f)]));
const original = webp => {
  for (const ext of ['.png', '.jpg', '.jpeg']) {
    const file = webp.replace(/\.webp$/, ext).split(path.sep).join('/');
    try {
      return execFileSync('git', ['show', `${ref}:${file}`], { maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      // not under this extension
    }
  }
  return null;
};
// Both images on white, as RGB, at the WebP's size.
const rgb = (input, width, height) =>
  sharp(input).flatten({ background: '#ffffff' }).resize(width, height, { fit: 'fill' }).removeAlpha().raw().toBuffer();

function ssim(a, b, w, h) {
  const luma = (px, i) => 0.299 * px[i * 3] + 0.587 * px[i * 3 + 1] + 0.114 * px[i * 3 + 2];
  const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;
  let sum = 0, n = 0;
  for (let y = 0; y + 8 <= h; y += 4) {
    for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0, mb = 0, va = 0, vb = 0, cov = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const k = (y + j) * w + x + i; ma += luma(a, k); mb += luma(b, k); }
      ma /= 64; mb /= 64;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const k = (y + j) * w + x + i, da = luma(a, k) - ma, db = luma(b, k) - mb;
        va += da * da; vb += db * db; cov += da * db;
      }
      va /= 63; vb /= 63; cov /= 63;
      sum += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2));
      n++;
    }
  }
  return sum / n;
}

function psnr(a, b) {
  let se = 0;
  for (let i = 0; i < a.length; i++) se += (a[i] - b[i]) ** 2;
  return 10 * Math.log10((255 * 255) / (se / a.length));
}

let failed = 0;
for (const file of files('src/assets').filter(f => f.endsWith('.webp')).sort()) {
  const orig = original(file);
  if (!orig) continue;
  const { width, height } = await sharp(file).metadata();
  const o = await sharp(orig).metadata();
  const [a, b] = await Promise.all([rgb(orig, width, height), rgb(file, width, height)]);
  const s = ssim(a, b, width, height);
  if (s < MIN_SSIM) failed++;
  const kb = bytes => `${Math.round(bytes / 1024)} kB`;
  console.log(`${path.relative('src/assets', file).padEnd(32)} ${`${o.width}x${o.height}`.padEnd(10)} → ${`${width}x${height}`.padEnd(10)} `
    + `SSIM ${s.toFixed(4)}  PSNR ${psnr(a, b).toFixed(1)} dB  ${kb(orig.length)} → ${kb(statSync(file).size)}${s < MIN_SSIM ? '  BELOW' : ''}`);
}
console.log(failed ? `${failed} image(s) below SSIM ${MIN_SSIM}` : `All images at or above SSIM ${MIN_SSIM}`);
process.exitCode = failed ? 1 : 0;
