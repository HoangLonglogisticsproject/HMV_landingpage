// @ts-check
import { test, expect } from '@playwright/test';

// The language switcher in the desktop header; on a phone it sits in the drawer (tests/navigation.mobile.spec.js).

// ─── Language switcher UI (desktop only) ────────────────────────────
// On mobile the switcher is inside the collapsed drawer.

test('language switcher changes the active locale', async ({ page }) => {
  // Start in English
  await page.goto('/?lang=en');
  await expect(page).toHaveURL('http://localhost:4173/', { timeout: 5000 });

  // LanguageSwitcher trigger: class="hmv-lang-trigger"
  // aria-label="Select language, current: English" when lang=en
  const trigger = page.locator('button.hmv-lang-trigger').first();
  await expect(trigger).toBeVisible({ timeout: 5000 });

  // Clicking opens the Radix DropdownMenu
  await trigger.click();

  // The "Tiếng Việt" menu item must be visible in the dropdown
  const viItem = page.locator('[role="menuitem"]:has-text("Tiếng Việt")').first();
  await expect(viItem).toBeVisible({ timeout: 3000 });
  await viItem.click();

  // After selection, localStorage must be updated to 'vi'
  await expect.poll(() => page.evaluate(() => localStorage.getItem('hmv_lang'))).toBe('vi');

  // H1 must now contain Vietnamese text (Bám rễ)
  const h1 = page.locator('h1').first();
  await expect(h1).toContainText('Bám rễ', { timeout: 3000 });
});

// ─── URL contract regression: ?lang=vi, then "English", must end on English ───
// The legacy `lang` parameter must not bring the visitor back to Vietnamese; product survives the switch.
// The Next.js build has the same cases in tests/next/language-switch.desktop.spec.js.

for (const { path, vi, en } of [
  { path: '/about?lang=vi', vi: 'Về HMV', en: 'About HMV' },
  { path: '/products/passion-fruit?lang=vi', vi: 'Nhà cung ứng chanh dây vàng Việt Nam', en: 'Vietnam Golden Passion Fruit Supplier' },
  { path: '/products/dried-cassava-chips?lang=vi', vi: 'Nguồn cung sắn lát khô số lượng lớn do HMV Global điều phối', en: 'Bulk Dried Cassava Chips Supply Managed by HMV Global' },
  { path: '/blog/exporting-passion-fruit-eu?lang=vi', vi: /^Xuất khẩu Chanh dây/, en: /^Exporting Passion Fruit/ },
  { path: '/contact?product=Passion%20fruit&lang=vi', vi: 'Kết nối hợp tác', en: 'Partner with us' },
]) {
  test(`${path}, then English, stays English`, async ({ page }) => {
    await page.goto(path);
    await expect(page).not.toHaveURL(/lang=/, { timeout: 5000 });
    const h1 = page.locator('h1').first();
    await expect(h1).toHaveText(vi, { timeout: 5000 });

    await page.locator('button.hmv-lang-trigger').first().click();
    await page.locator('[role="menuitem"]:has-text("English")').first().click();
    await expect(h1).toHaveText(en, { timeout: 5000 });
    await page.reload();
    await expect(h1).toHaveText(en, { timeout: 5000 });
    await expect(page).not.toHaveURL(/lang=/);

    if (path.startsWith('/contact')) {
      expect(new URL(page.url()).searchParams.get('product')).toBe('Passion fruit');
      await expect(page.locator('form.inquiry-form select[name="product"]')).toHaveValue('Passion fruit');
    }
  });
}
