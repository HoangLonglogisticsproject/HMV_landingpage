// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Rollback compatibility (Vite build). After a rollback from Next.js, visitors and crawlers still request the new
 * Vietnamese URLs, including the targets of 308s their browsers cached. The Vite build must render each one in
 * Vietnamese, via the shared route contract (src/i18n/routes.js, LegacyLocaleRedirect).
 * See docs/architecture/MIGRATION_ROADMAP.md, rollback contract.
 */

const CASES = [
  ['/vi', '/', /Bám rễ từ đất lành/],
  ['/vi/about', '/about', 'Về HMV'],
  ['/vi/contact', '/contact', 'Kết nối hợp tác'],
  ['/vi/san-pham/chanh-day', '/products/passion-fruit', 'Chanh dây tươi từ Việt Nam'],
  ['/vi/san-pham/san-lat-kho', '/products/dried-cassava-chips', 'Sắn lát khô cho khách hàng công nghiệp'],
  ['/vi/san-pham/hat-dieu', '/products/nuts', 'Hạt điều'],
  ['/vi/tin-tuc/xuat-khau-chanh-day-eu', '/blog/exporting-passion-fruit-eu', /^Xuất khẩu Chanh dây/],
  ['/vi/trade-solutions', '/trade-solutions', 'Giải pháp thương mại'],
  ['/vi/san-pham', '/trade-solutions', 'Giải pháp thương mại'],
  ['/vi/tin-tuc', '/insights', 'EcoNews'],
];

for (const [from, to, h1] of CASES) {
  test(`Next.js URL ${from} renders in Vietnamese on the Vite build`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(url => url.pathname === to, { timeout: 8000 });
    await expect(page.locator('h1').first()).toHaveText(h1, { timeout: 8000 });
  });
}
