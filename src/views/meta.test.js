import { test } from 'vitest';
import assert from 'node:assert/strict';
import { articleJsonLd, siteJsonLd } from './meta.js';

// Facts under D-12 review (audit §9) that are on the site today and must not reach structured data before HMV confirms
// them: people and titles (C-02), contact channels (C-05), the email domain (C-04).
const UNVERIFIED = ['Ho Quang Minh', 'Hieu Truong', 'Van Nguyen', 'Chairman', 'Managing Director', 'General Manager',
  '@hmvglobal.com', '909 123 456', '902 468 910', 'HMV Logistics', 'certif', 'Floor 5'];

test('site structured data: Organization and WebSite with confirmed facts only', () => {
  const json = siteJsonLd();
  const [org, site] = JSON.parse(json)['@graph'];
  assert.deepEqual(Object.keys(org).sort(), ['@id', '@type', 'alternateName', 'logo', 'name', 'url']);
  assert.deepEqual(site.publisher, { '@id': org['@id'] });
  for (const claim of UNVERIFIED) assert.ok(!json.includes(claim), claim);
});

test('article structured data: the CMS author as a Person, else the organization; absolute image; no </script>', () => {
  const article = { title: 'T</script>', date: { iso: '2026-10-01' }, image: { src: '/media/x.jpg' }, author: 'An Nguyen' };
  const json = articleJsonLd('vi', article);
  assert.ok(!json.includes('</script>'));
  const data = JSON.parse(json);
  assert.deepEqual(data.author, { '@type': 'Person', name: 'An Nguyen' });
  assert.equal(data.image, 'https://www.hmv-global.com/media/x.jpg');
  assert.equal(JSON.parse(articleJsonLd('en', { ...article, author: null })).author['@type'], 'Organization');
});
