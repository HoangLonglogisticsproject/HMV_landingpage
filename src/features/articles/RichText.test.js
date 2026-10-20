import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText } from './RichText.js';

const html = doc => renderToStaticMarkup(createElement(RichText, { doc }));
const doc = (...content) => ({ type: 'doc', content });
const p = (...content) => ({ type: 'paragraph', content });
const text = (t, marks) => (marks ? { type: 'text', text: t, marks } : { type: 'text', text: t });
const link = (href, attrs = {}) => ({ type: 'link', attrs: { href, ...attrs } });

test('renders every node and mark the CMS whitelist allows', () => {
  // Built like CMS_HMV backend rich-content.spec.ts ("accepts what the CMS editor emits"), after read-time hydration.
  const out = html(doc(
    { type: 'heading', attrs: { level: 2 }, content: [text('Tiêu đề')] },
    { type: 'heading', attrs: { level: 3 }, content: [text('Mục')] },
    p(text('a', [{ type: 'bold' }]), text('b', [{ type: 'italic' }]), text('c', [{ type: 'underline' }]), text('d', [{ type: 'strike' }]), text('e', [{ type: 'code' }]),
      { type: 'hardBreak' },
      text('báo cáo', [{ type: 'bold' }, link('https://hmv.example/r', { target: '_blank', rel: 'noopener noreferrer nofollow', class: 'text-[#087EC2] underline', title: null })])),
    { type: 'blockquote', content: [p(text('Trích dẫn'))] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [p(text('Một'))] }] },
    { type: 'orderedList', attrs: { start: 3, type: null }, content: [{ type: 'listItem', content: [p(text('Hai'))] }] },
    { type: 'image', attrs: { src: 'http://localhost:4000/media-files/media/2026/10/x.webp', alt: 'Cà phê', title: null, width: 1200, height: null, mediaId: '0199f3a0-0000-7000-8000-000000000001' } },
    { type: 'codeBlock', attrs: { language: null }, content: [text('x = 1 < 2')] },
    { type: 'horizontalRule' },
    p(),
  ));
  assert.equal(out, [
    '<h2>Tiêu đề</h2><h3>Mục</h3>',
    '<p><strong>a</strong><em>b</em><u>c</u><s>d</s><code>e</code><br/>',
    '<a href="https://hmv.example/r" target="_blank" rel="noopener noreferrer nofollow"><strong>báo cáo</strong></a></p>',
    '<blockquote><p>Trích dẫn</p></blockquote>',
    '<ul><li>Một</li></ul><ol start="3"><li>Hai</li></ol>',
    '<img src="http://localhost:4000/media-files/media/2026/10/x.webp" alt="Cà phê" width="1200" loading="lazy" decoding="async"/>',
    '<pre><code>x = 1 &lt; 2</code></pre><hr/><p></p>',
  ].join(''));
});

test('a single-paragraph list item keeps the bundled article markup', () => {
  const out = html(doc({ type: 'bulletList', content: [{ type: 'listItem', content: [p(text('Rooted in the Farm:', [{ type: 'bold' }]), text(' Direct linkages.'))] }] }));
  assert.equal(out, '<ul><li><strong>Rooted in the Farm:</strong> Direct linkages.</li></ul>');
  const multi = html(doc({ type: 'bulletList', content: [{ type: 'listItem', content: [p(text('a')), p(text('b'))] }] }));
  assert.equal(multi, '<ul><li><p>a</p><p>b</p></li></ul>');
});

test('unsafe link targets lose the link but keep the text', () => {
  for (const href of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', ' javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'vbscript:msgbox(1)', '//evil.example', '', null, 'x'.repeat(2049)]) {
    const out = html(doc(p(text('click', [link(href)]))));
    assert.equal(out, '<p>click</p>', `href ${JSON.stringify(href)?.slice(0, 40)}`);
  }
});

test('safe links: relative, anchors, mailto, tel; target only _blank; rel whitelisted', () => {
  assert.equal(html(doc(p(text('a', [link('/insights')])))), '<p><a href="/insights">a</a></p>');
  assert.equal(html(doc(p(text('a', [link('#top')])))), '<p><a href="#top">a</a></p>');
  assert.equal(html(doc(p(text('a', [link('mailto:x@hmv.example')])))), '<p><a href="mailto:x@hmv.example">a</a></p>');
  assert.equal(html(doc(p(text('a', [link('tel:+84123')])))), '<p><a href="tel:+84123">a</a></p>');
  assert.equal(html(doc(p(text('a', [link('https://x.example', { target: '_top', rel: 'opener ugc evil' })])))), '<p><a href="https://x.example" rel="ugc">a</a></p>');
  assert.equal(html(doc(p(text('a', [link('https://x.example', { target: '_blank' })])))), '<p><a href="https://x.example" target="_blank" rel="noopener noreferrer">a</a></p>');
});

test('unsafe or missing image sources render nothing', () => {
  for (const src of ['javascript:alert(1)', 'data:image/png;base64,AAAA', 'mailto:x@y.z', '#x', '//evil.example/x.png', null, undefined]) {
    assert.equal(html(doc({ type: 'image', attrs: { src, alt: 'x' } })), '', `src ${src}`);
  }
  assert.equal(html(doc({ type: 'image', attrs: { src: '/og-image.jpg', alt: null, width: -5, height: '9' } })), '<img src="/og-image.jpg" alt="" loading="lazy" decoding="async"/>');
});

test('text is escaped, never parsed as HTML', () => {
  const out = html(doc(p(text('<script>alert(1)</script><img src=x onerror=alert(1)>'))));
  assert.equal(out, '<p>&lt;script&gt;alert(1)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;</p>');
});

test('unknown nodes keep their text, unknown marks and attributes are dropped', () => {
  const out = html(doc(
    { type: 'iframe', attrs: { src: 'https://evil.example' } },
    { type: 'table', content: [p(text('cell'))] },
    p({ type: 'text', text: 'x', marks: [{ type: 'highlight' }, { type: 'textStyle', attrs: { style: 'color:red' } }] }),
    { type: 'paragraph', attrs: { class: 'x', style: 'color:red', onclick: 'alert(1)' }, content: [text('y')] },
    { type: 'heading', attrs: { level: 1 }, content: [text('h1')] },
    { type: 'heading', attrs: { level: 6 }, content: [text('h6')] },
    'stray', null, 42,
  ));
  assert.equal(out, '<p>cell</p><p>x</p><p>y</p><h2>h1</h2><h2>h6</h2>');
});

test('empty or missing content renders nothing', () => {
  assert.equal(html(null), '');
  assert.equal(html({ type: 'doc' }), '');
  assert.equal(html({ type: 'doc', content: 'nope' }), '');
});

// Real payload: article created, approved and published through the CMS admin UI (see fixtures/cms-article.json).
const real = JSON.parse(readFileSync(new URL('./fixtures/cms-article.json', import.meta.url), 'utf8'));

test('renders a real published CMS article exactly', () => {
  assert.equal(html(real.en.content), [
    '<p>Test intro paragraph with <strong>bold text</strong>, <em>italic text</em>, <u>underlined text</u>, <s>struck text</s>, and a ',
    '<a href="https://www.example.com/hmv-econews-test" target="_blank" rel="noopener noreferrer nofollow">source link</a></p>',
    '<h2>Test level-2 heading</h2><p>Paragraph under the level-2 heading.</p><h3>Test level-3 heading</h3>',
    '<ul><li>Bullet item one</li><li>Bullet item two</li></ul><ol><li>Step one</li><li>Step two</li></ol>',
    '<blockquote><p>A test quotation from the CMS.</p></blockquote><hr/><p>Closing paragraph, right before the inline image.</p>',
    '<img src="http://localhost:4000/media-files/media/2026/10/66ca803e-e83c-4c06-b93f-3cdea523a292.png" alt="Test inline illustration" loading="lazy" decoding="async"/><p></p>',
  ].join(''));
});

test('the Vietnamese version has the same structure with its own text and alt', () => {
  const tags = h => h.match(/<\/?[a-z0-9]+/g).join('');
  const vi = html(real.vi.content);
  assert.equal(tags(vi), tags(html(real.en.content)));
  assert.ok(vi.includes('<a href="https://www.example.com/hmv-econews-test" target="_blank" rel="noopener noreferrer nofollow">liên kết nguồn</a>'));
  assert.match(vi, /alt="Ảnh minh họa kiểm thử"/);
});
