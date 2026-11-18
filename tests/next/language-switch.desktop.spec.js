// @ts-check
import { test, expect } from '@playwright/test';

// Language switch regressions: the old `lang` parameter must never bring the visitor back to the old language,
// while product, UTM and #hash survive the switch.
test.describe('language switch', () => {
  const switchTo = async (page, label) => {
    await page.locator('button.hmv-lang-trigger').first().click();
    await page.locator(`[role="menuitem"]:has-text("${label}")`).first().click();
  };

  test('/about?lang=vi, then English, stays English', async ({ page }) => {
    await page.goto('/about?lang=vi');
    await expect(page).toHaveURL(/\/vi\/about$/);
    await expect(page.locator('h1').first()).toHaveText('Về HMV');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('h1').first()).toHaveText('About HMV');
    await page.reload();
    await expect(page.locator('h1').first()).toHaveText('About HMV');
  });

  test('contact keeps the product and UTM parameters across the switch', async ({ page }) => {
    await page.goto('/contact?product=Passion%20fruit&utm_source=li&lang=vi');
    await expect(page).toHaveURL(/\/vi\/contact\?product=Passion\+fruit&utm_source=li$/);
    const select = page.locator('form.inquiry-form select[name="product"]');
    await expect(select).toHaveValue('Passion fruit');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/contact\?product=Passion\+fruit&utm_source=li$/);
    await expect(page.locator('h1').first()).toHaveText('Partner with us');
    await expect(select).toHaveValue('Passion fruit');
  });

  test('a product page switches to its pair: dried cassava chips ↔ sắn lát khô', async ({ page }) => {
    await page.goto('/products/dried-cassava-chips');
    await switchTo(page, 'Tiếng Việt');
    await expect(page).toHaveURL(/\/vi\/san-pham\/san-lat-kho$/);
    await expect(page.locator('h1').first()).toHaveText('Nguồn cung sắn lát khô số lượng lớn do HMV Global điều phối');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/products\/dried-cassava-chips$/);
    await expect(page.locator('h1').first()).toHaveText('Bulk Dried Cassava Chips Supply Managed by HMV Global');
  });

  // Simplified Chinese and Korean are page-scoped (PAGE_LOCALES): offered on the EN and VI cassava pages only.
  test('the cassava pages, and only they, offer Simplified Chinese and Korean, links to their pages', async ({ page }) => {
    const chinese = page.getByRole('menuitem', { name: '简体中文' });
    const korean = page.getByRole('menuitem', { name: '한국어' });
    for (const path of ['/products/dried-cassava-chips', '/vi/san-pham/san-lat-kho']) {
      await page.goto(path);
      await page.locator('button.hmv-lang-trigger').first().click();
      await expect(page.getByRole('menuitem')).toHaveText(['English', 'Tiếng Việt', '简体中文', '한국어']);
      await expect(chinese).toHaveAttribute('href', '/zh-cn/cassava-chips');
      await expect(chinese).toHaveAttribute('hreflang', 'zh-CN');
      await expect(korean).toHaveAttribute('href', '/ko/tapioca-chips');
      await expect(korean).toHaveAttribute('hreflang', 'ko');
    }
    await korean.click();
    await expect(page).toHaveURL(/\/ko\/tapioca-chips$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
    for (const path of ['/', '/products/passion-fruit', '/vi/san-pham/chanh-day', '/about']) {
      await page.goto(path);
      await page.locator('button.hmv-lang-trigger').first().click();
      await expect(page.getByRole('menuitem')).toHaveText(['English', 'Tiếng Việt']);
    }
  });

  test('the #hash survives the switch', async ({ page }) => {
    await page.goto('/vi#initiate-trade');
    await switchTo(page, 'English');
    await expect(page).toHaveURL(/\/#initiate-trade$/);
    await expect(page.locator('h1').first()).toContainText('Rooted in the land');
  });
});
