// webServer of playwright.next-cms.config.js: starts the mock CMS, builds Next.js with CMS_CONTENT=true against it,
// then serves that build. The build goes to .next and replaces any bundled build there. Output is copied to
// SERVER_LOG, which the suite checks for leaked secrets. Child processes are asynchronous: the mock runs here.
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startMockCms } from './mock-cms.js';
import { CMS_ENV, NEXT_PORT, SERVER_LOG } from './env.js';

await startMockCms();
const env = { ...process.env, ...CMS_ENV };
const log = createWriteStream(SERVER_LOG);
const NEXT = fileURLToPath(import.meta.resolve('next/dist/bin/next'));

// Runs the Next.js CLI with this Node.js binary: no shell, fixed arguments.
function next(...args) {
  const child = spawn(process.execPath, [NEXT, ...args], { env });
  for (const stream of [child.stdout, child.stderr]) {
    stream.pipe(log, { end: false });
    stream.pipe(process.stdout, { end: false });
  }
  return new Promise(resolve => child.on('exit', code => resolve(code ?? 1)));
}

const built = await next('build');
process.exit(built === 0 ? await next('start', '-p', String(NEXT_PORT)) : built);
