import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { findEntryViolations } from './check-css-entry.js';

const MODULES = ['00-a.css', '10-b.css'];
const ENTRY = "/* The entry.\n   Two lines. */\n@import './hmv/00-a.css';\n\n@import './hmv/10-b.css';\n";
const check = css => findEntryViolations(css, MODULES);

test('the repository entry imports every module once and holds no rule', () => {
  const modules = readdirSync('src/styles/hmv').filter(file => file.endsWith('.css'));
  assert.ok(modules.length > 1);
  assert.deepEqual(findEntryViolations(readFileSync('src/styles/hmv.css', 'utf8'), modules), []);
});

test('pass: comments, blank lines and the module imports, with CRLF line ends too', () => {
  assert.deepEqual(check(ENTRY), []);
  assert.deepEqual(check(ENTRY.replace(/\n/g, '\r\n')), []);
});

test('fail: a rule appended to the entry, on the line where it starts', () => {
  assert.deepEqual(check(`${ENTRY}.foo {\n  color: red;\n}\n`), [
    'line 6: only comments and module imports belong here: .foo {',
    'line 7: only comments and module imports belong here: color: red;',
    'line 8: only comments and module imports belong here: }',
  ]);
});

test('fail: other at-rules, imports from elsewhere, and text after an unclosed comment', () => {
  for (const line of ["@media (max-width: 600px) { .a { color: red } }", "@import url('./hmv/00-a.css');",
    "@import '../index.css';", "@import './hmv/00-a.css' layer(base);", '/* unclosed']) {
    assert.equal(check(`${ENTRY}${line}\n`).length, 1, line);
  }
});

test('fail: a missing module, a module imported twice, a module never imported', () => {
  assert.deepEqual(check(`${ENTRY}@import './hmv/20-c.css';\n`), ['line 6: no module 20-c.css in src/styles/hmv/']);
  assert.deepEqual(check(`${ENTRY}@import './hmv/00-a.css';\n`), ['line 6: 00-a.css is imported twice']);
  assert.deepEqual(check("@import './hmv/00-a.css';\n"), ['10-b.css is not imported']);
});
