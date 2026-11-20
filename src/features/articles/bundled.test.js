import { test } from 'vitest';
import assert from 'node:assert/strict';
import { toDoc } from './bundled.js';

const inline = text => toDoc([['p', text]]).content[0].content;
const link = (text, href) => ({ type: 'text', text, marks: [{ type: 'link', attrs: { href } }] });

test('bundled copy: `[text](path)` becomes a link mark, in paragraphs and list items; anything else stays text', () => {
  assert.deepEqual(inline('See [the page](/products/x#quality) first.'), [{ type: 'text', text: 'See ' }, link('the page', '/products/x#quality'), { type: 'text', text: ' first.' }]);
  assert.deepEqual(inline('[a](/a)[b](/b)'), [link('a', '/a'), link('b', '/b')]);
  for (const text of ['plain', 'no [link] here', 'cut [off](/x', 'only ] and ) and ](']) assert.deepEqual(inline(text), [{ type: 'text', text }], text);
  const [item] = toDoc([['ul', [['Bold:', 'see [it](/y).']]]]).content[0].content;
  assert.deepEqual(item.content[0].content, [{ type: 'text', text: 'Bold:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' see ' }, link('it', '/y'), { type: 'text', text: '.' }]);
});
