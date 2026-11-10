import { defineConfig } from '@playwright/test';
import next from './playwright.next.config.js';

/**
 * D-14 visual baselines of the Next.js build (tests/next-visual/). Linux only: text renders differently on other
 * platforms, so CI runs this config in the pinned Playwright image (.github/workflows/ci.yml, job `visual`), the same
 * image that generated the baselines (`*-linux.png`). No retries: a flaky screenshot must fail.
 * 120 s per test: the first navigation of a run is cold (up to 16 s), and a full-page capture of the desktop home takes
 * about 2 s, several times when a screenshot is compared or regenerated. The pages themselves are static once settled.
 */
export default defineConfig({
  ...next,
  testDir: './tests/next-visual',
  retries: 0,
  timeout: 120_000,
  use: { ...next.use, reducedMotion: 'reduce' },
  expect: { timeout: 30_000, toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css' } },
});
