import { test } from 'vitest';
import assert from 'node:assert/strict';
import { toDoc } from '../features/articles/bundled.js';
import { articles } from './articles.js';
import { cassavaChina } from './cassavaChina.js';
import { cassavaChinaGuides } from './cassavaChinaGuides.js';
import { cassavaKorea } from './cassavaKorea.js';
import { cassavaKoreaGuides } from './cassavaKoreaGuides.js';
import { productPages } from './productPages.js';

// Search intent of the dried cassava chips pages: the four money pages (EN, VI, zh-CN, ko) keep the supply and
// procurement intent; the guides and articles beneath them answer informational queries, never target that intent, and
// are neither thin nor copies of one another.
const cassavaArticles = articles.filter(a => a.product === 'dried-cassava-chips');
const zhGuides = Object.values(cassavaChinaGuides.items);
const koGuides = Object.values(cassavaKoreaGuides.items);
const { seo } = productPages['dried-cassava-chips'];

// Per language: the money page's SEO, the keyword of its intent, and the supporting content's title, description and heading.
const LANGUAGES = [
  ['en', seo.en, /supplier/i, cassavaArticles.map(a => [a.title.en, a.description.en, a.slug.en])],
  ['vi', seo.vi, /nhà cung cấp/i, cassavaArticles.map(a => [a.title.vi, a.description.vi, a.slug.vi])],
  ['zh-CN', cassavaChina.seo, /供应商/, zhGuides.map(g => [g.seo.title, g.seo.description, g.h1])],
  // 공급 (supply) is the money page's keyword; the guides are about buying and checking.
  ['ko', cassavaKorea.seo, /공급/, koGuides.map(g => [g.seo.title, g.seo.description, g.h1])],
];

test('the money pages keep the supply intent in their title; no supporting title, description or heading targets it', () => {
  for (const [lang, money, intent, supporting] of LANGUAGES) {
    assert.match(money.title, intent, lang);
    for (const copy of supporting) assert.doesNotMatch(copy.join(' '), intent, `${lang} ${copy[0]}`);
  }
  // The Korean money page's own heading carries the intent too.
  assert.match(cassavaKorea.hero.h1, /공급/);
});

test('every title, description and heading of the cassava pages is unique: no guide repeats a money page or another guide', () => {
  const seos = [
    seo.en, seo.vi, cassavaChina.seo, cassavaKorea.seo,
    ...cassavaArticles.flatMap(a => [{ title: a.title.en, description: a.description.en }, { title: a.title.vi, description: a.description.vi }]),
    ...zhGuides.map(g => g.seo),
    ...koGuides.map(g => g.seo),
  ];
  for (const key of ['title', 'description']) assert.equal(new Set(seos.map(s => s[key])).size, seos.length, key);
  const headings = [...zhGuides.map(g => g.h1), ...koGuides.map(g => g.h1), ...cassavaArticles.flatMap(a => [a.title.en, a.title.vi]), cassavaChina.hero.h1, cassavaKorea.hero.h1];
  assert.equal(new Set(headings).size, headings.length);
});

const textOf = node => node.text ?? (node.content ?? []).map(textOf).join('');
// Bundled copy as plain text, links resolved by the renderer's own parser: the whole body, or its paragraphs.
const plain = blocks => textOf(toDoc(blocks));
const paragraphs = blocks => blocks.filter(([tag]) => tag === 'p').map(block => plain([block]));
const sentences = copy => paragraphs(copy).flatMap(p => p.split(/[.。]\s+/)).filter(s => s.length > 20);

test('no thin page: each guide has substantial body copy and several sections', () => {
  for (const g of koGuides) {
    assert.ok(plain(g.body).length >= 1200, g.h1);
    assert.ok(g.body.filter(([tag]) => tag === 'h2').length >= 5, g.h1);
  }
  for (const g of zhGuides) assert.ok(plain(g.body).length >= 500, g.h1);
  for (const a of cassavaArticles) {
    for (const lang of ['en', 'vi']) assert.ok(plain(a.body[lang]).length >= 2500, `${lang} ${a.id}`);
  }
});

test('no duplicate page: no paragraph sentence is repeated across the guides of a language', () => {
  const sets = [
    ['en', cassavaArticles.map(a => a.body.en)],
    ['vi', cassavaArticles.map(a => a.body.vi)],
    ['zh', zhGuides.map(g => g.body)],
    ['ko', koGuides.map(g => g.body)],
  ];
  for (const [lang, bodies] of sets) {
    const all = bodies.flatMap(sentences);
    const repeated = all.filter((s, i) => all.indexOf(s) !== i);
    assert.deepEqual(repeated, [], lang);
  }
});
