import { test } from 'vitest';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { cassavaEvidence as evidence } from './cassavaEvidence.js';
import { productPages } from './productPages.js';
import { productPhotos } from './productPhotos.js';

const LANGS = ['en', 'vi', 'zh', 'ko'];
const strings = v => (typeof v === 'string' ? [v] : Object.values(v).flatMap(strings));

test('three photographs, three kinds of evidence: bulk stock, container loading, the product', () => {
  assert.deepEqual(evidence.photos.map(p => p.id), ['stock', 'loading', 'product']);
  assert.match(evidence.photos[0].src, /\/cassava-bulk-stock\.webp$/);
  assert.match(evidence.photos[1].src, /\/cassava-container-loading\.webp$/);
  // The product photograph on the site, cropped to its 4:3 frame; its alt text is that photograph's.
  assert.match(evidence.photos[2].src, /\/dried-cassava-chips-detail\.webp$/);
  assert.equal(evidence.photos[2].alt.en, productPhotos['dried-cassava-chips'].altEn);
});

// The width and height attributes reserve the space before the lazy image loads: they must be the file's.
test('each photograph declares the size of its file', async () => {
  for (const p of evidence.photos) {
    // Vitest serves assets from the project root: /src/assets/…
    const { width, height } = await sharp(`.${p.src}`).metadata();
    assert.deepEqual([p.width, p.height], [width, height], p.id);
  }
});

test('copy, alt text and captions in English, Vietnamese, Simplified Chinese and Korean', () => {
  assert.deepEqual(Object.keys(evidence.copy), LANGS);
  for (const lang of LANGS) assert.ok(['eyebrow', 'title', 'text', 'note'].every(k => evidence.copy[lang][k]), lang);
  for (const p of evidence.photos) {
    for (const lang of LANGS) assert.ok(p.alt[lang] && p.caption[lang] && p.alt[lang] !== p.caption[lang], `${p.id} ${lang}`);
    assert.equal(new Set(LANGS.map(l => p.alt[l])).size, LANGS.length, p.id);
    assert.equal(new Set(LANGS.map(l => p.caption[l])).size, LANGS.length, p.id);
  }
});

test('the EN/VI dried cassava chips page shows these photographs; no other product page does', () => {
  for (const [id, page] of Object.entries(productPages)) assert.equal(page.supplyEvidence, id === 'dried-cassava-chips' ? evidence : undefined, id);
});

// The photographs show product and activity. Where, in whose facility and how much are not asserted, so no place,
// ownership or figure (which would tie a photograph to the network capacity figures).
test('no location, ownership or capacity claim in the copy, alt text or captions', () => {
  const all = [...strings(evidence.copy), ...evidence.photos.flatMap(p => [...strings(p.alt), ...strings(p.caption)])];
  for (const s of all) {
    assert.doesNotMatch(s, /\d/, s);
    assert.doesNotMatch(s, /T[âa]y Ninh|T[âa]n L[ậa]p|Long An|Cambodia|Campuchia|柬埔寨|Vietnam|Việt Nam|越南|warehouse|owned|factory|nhà máy|sở hữu|仓库|工厂|自有/i, s);
  }
});
