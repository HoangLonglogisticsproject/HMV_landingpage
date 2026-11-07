// Whitelist renderer for CMS rich content v1 (Tiptap JSON). Every node becomes a React element and
// text stays a string child, so React escapes it: no HTML from the CMS is ever injected.
// Plain .js with createElement so `node --test` can render it without a JSX transform.
import { createElement as h, Fragment } from 'react';
import { isSafeHref, isSafeSrc } from '../../lib/safeUrl.js';

const MARKS = { bold: 'strong', italic: 'em', strike: 's', underline: 'u', code: 'code' };
const BLOCKS = { paragraph: 'p', blockquote: 'blockquote', bulletList: 'ul' };
const REL = new Set(['noopener', 'noreferrer', 'nofollow', 'ugc', 'sponsored']);
const str = v => (typeof v === 'string' ? v : undefined);
const dim = v => (Number.isInteger(v) && v > 0 ? v : undefined);

function linkProps(attrs = {}) {
  if (!isSafeHref(attrs.href)) return null;
  const blank = attrs.target === '_blank';
  const rel = new Set(String(attrs.rel ?? '').split(/\s+/).filter(t => REL.has(t)));
  if (blank) rel.add('noopener').add('noreferrer');
  return { href: attrs.href, target: blank ? '_blank' : undefined, rel: rel.size ? [...rel].join(' ') : undefined, title: str(attrs.title) };
}

function text(node) {
  let out = str(node.text) ?? '';
  for (const mark of Array.isArray(node.marks) ? node.marks : []) {
    if (mark?.type === 'link') {
      const props = linkProps(mark.attrs);
      if (props) out = h('a', props, out);
    } else if (MARKS[mark?.type]) out = h(MARKS[mark.type], null, out);
    // Unknown marks are dropped; the text stays.
  }
  return out;
}

function render(node) {
  if (!node || typeof node !== 'object') return null;
  const content = Array.isArray(node.content) ? node.content : [];
  const a = node.attrs ?? {};
  switch (node.type) {
    case 'text':
      return text(node);
    case 'heading':
      // The CMS allows levels 2 and 3 only; the page <h1> is the article title.
      return h(a.level === 3 ? 'h3' : 'h2', null, ...content.map(render));
    case 'orderedList':
      // ponytail: `type` (a/i) ignored, always decimal; add per-type CSS if editors start using it.
      return h('ol', { start: Number.isInteger(a.start) && a.start !== 1 ? a.start : undefined }, ...content.map(render));
    case 'listItem': {
      // A single-paragraph item renders inline, matching the static article markup (<li><strong>…</strong> …</li>).
      const only = content.length === 1 && content[0]?.type === 'paragraph' ? content[0].content : null;
      return h('li', null, ...(Array.isArray(only) ? only : content).map(render));
    }
    case 'codeBlock':
      return h('pre', null, h('code', null, ...content.map(render)));
    case 'horizontalRule':
      return h('hr');
    case 'hardBreak':
      return h('br');
    case 'image':
      // src is resolved by the CMS at read time and is null when the media item no longer exists.
      return isSafeSrc(a.src)
        ? h('img', { src: a.src, alt: str(a.alt) ?? '', title: str(a.title), width: dim(a.width), height: dim(a.height), loading: 'lazy', decoding: 'async' })
        : null;
    default:
      // doc, known blocks, and unknown nodes (wrapper dropped, text kept).
      return h(BLOCKS[node.type] ?? Fragment, null, ...content.map(render));
  }
}

export function RichText({ doc }) {
  return render(doc);
}
