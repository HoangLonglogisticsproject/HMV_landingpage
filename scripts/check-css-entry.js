// The stylesheet entry (docs/architecture/CSS_ARCHITECTURE.md): src/styles/hmv.css holds comments and the imports of
// its modules, nothing else, and imports every module in src/styles/hmv/ exactly once; the rules live in the modules.
// Run by `npm run lint`; tested by check-css-entry.test.js.
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const IMPORT = /^@import '\.\/hmv\/([\w-]+\.css)';$/;

/** Violations in the entry's text `css`, given the module file names in src/styles/hmv/. */
export function findEntryViolations(css, modules) {
  // Comments become spaces, so the line numbers stay; an unclosed comment stays text and is reported.
  const lines = css.replace(/\/\*[\s\S]*?\*\//g, comment => comment.replace(/[^\n]/g, ' ')).split(/\r?\n/);
  const violations = [];
  const imported = [];
  lines.forEach((line, i) => {
    if (line.trim() === '') return;
    const module = IMPORT.exec(line.trim())?.[1];
    if (!module) violations.push(`line ${i + 1}: only comments and module imports belong here: ${line.trim()}`);
    else if (!modules.includes(module)) violations.push(`line ${i + 1}: no module ${module} in src/styles/hmv/`);
    else if (imported.includes(module)) violations.push(`line ${i + 1}: ${module} is imported twice`);
    else imported.push(module);
  });
  for (const module of modules) if (!imported.includes(module)) violations.push(`${module} is not imported`);
  return violations;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const styles = path.resolve(import.meta.dirname, '../src/styles');
  const modules = readdirSync(path.join(styles, 'hmv')).filter(file => file.endsWith('.css'));
  const violations = findEntryViolations(readFileSync(path.join(styles, 'hmv.css'), 'utf8'), modules);
  if (violations.length) {
    console.error(`Stylesheet entry violations (scripts/check-css-entry.js), src/styles/hmv.css:\n  ${violations.join('\n  ')}`);
    process.exit(1);
  }
  console.log('Stylesheet entry: OK');
}
