// @ts-check
import { test, expect } from '@playwright/test';

// The page-scoped cassava pages' layout, from desktop to phone widths. The test sets each viewport itself, so it runs
// in the desktop project only (*.desktop.spec.js, playwright.next.config.js).
const PAGES = [['/zh-cn/cassava-chips', '向 HMV 提交采购需求'], ['/ko/tapioca-chips', 'HMV에 원료 구매 요구사항 전달']];
// The same procurement page in the site's chrome (EN, VI): its layout test too.
const PROCUREMENT = [...PAGES, ['/products/dried-cassava-chips', 'Build Your Cassava Supply Plan with HMV'], ['/vi/san-pham/san-lat-kho', 'Xây dựng phương án cung ứng sắn lát cùng HMV']];

test('layout: no horizontal overflow from 1440 to 375 px; the primary call to action is in the first viewport', async ({ page }) => {
  for (const [path, cta] of PROCUREMENT) {
    for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
      const where = `${path} ${width}×${height}`;
      await page.setViewportSize({ width, height });
      await page.goto(path);
      const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
      expect(size[0], where).toBeLessThanOrEqual(size[1]);
      const box = await page.getByRole('button', { name: cta }).first().boundingBox();
      expect(box && box.y >= 0 && box.y + box.height <= height && box.x + box.width <= width, where).toBe(true);
    }
  }
});

// The site's language menu in the scoped header: beside the HMV Trade Desk button, as high, down to tablets; alone and
// compact on phones; open, the list is as wide as the trigger and inside the viewport.
test('header: the language menu beside the HMV Trade Desk, then alone on phones; its list fits from 1440 to 375 px', async ({ page }) => {
  const trigger = page.locator('header button.hmv-lang-trigger');
  const desk = page.locator('header .nav-support-btn');
  for (const [path] of PAGES) {
    for (const [width, height] of [[1440, 900], [1280, 720], [1024, 768], [768, 1024], [390, 844], [375, 667]]) {
      const where = `${path} ${width}×${height}`;
      await page.setViewportSize({ width, height });
      await page.goto(path);
      const t = await trigger.boundingBox();
      expect([t?.width, t?.height], where).toEqual([width > 600 ? 176 : 160, 40]);
      if (width > 600) {
        const d = await desk.boundingBox();
        expect([d?.y, d?.height], where).toEqual([t?.y, 40]);
        expect(t && d && t.x + t.width < d.x, where).toBe(true);
      } else {
        await expect(desk, where).toBeHidden();
      }
      await trigger.click();
      // Measured once it has zoomed in.
      const list = page.locator('.hmv-lang-menu-content');
      await list.evaluate(el => Promise.all(el.getAnimations().map(a => a.finished)));
      const menu = await list.boundingBox();
      // As wide as the trigger, 176 px on phones; every name on one line.
      expect(menu && menu.x >= 0 && menu.x + menu.width <= width && Math.round(menu.width) === 176, where).toBe(true);
      expect(await list.locator('.hmv-lang-item-label').evaluateAll(els => els.every(el => {
        const text = document.createRange();
        text.selectNodeContents(el);
        return text.getClientRects().length === 1;
      })), where).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), where).toBe(0);
    }
  }
});

test('keyboard: Enter opens on English, the arrows move, Escape closes and the trigger has the focus again', async ({ page }) => {
  await page.goto('/ko/tapioca-chips');
  const trigger = page.getByRole('button', { name: '언어 선택, 현재: 한국어' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitem', { name: 'English' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Tiếng Việt' })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('menuitem', { name: '한국어' })).toBeFocused();
  await expect(page.getByRole('menuitem', { name: '한국어' })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toBeHidden();
  await expect(trigger).toBeFocused();
  // A visible focus ring on the trigger.
  expect(await trigger.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
});

test('switching: Korean to Chinese to English by real links, and back and forward through them', async ({ page }) => {
  const choose = async (current, target) => {
    await page.getByRole('button', { name: current }).click();
    await page.getByRole('menuitem', { name: target }).click();
  };
  await page.goto('/ko/tapioca-chips');
  await choose('언어 선택, 현재: 한국어', '简体中文');
  await expect(page).toHaveURL(/\/zh-cn\/cassava-chips$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('header button.hmv-lang-trigger')).toHaveText('简体中文');
  await choose('选择语言，当前：简体中文', 'English');
  await expect(page).toHaveURL(/\/products\/dried-cassava-chips$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Select language, current: English' }).first()).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/zh-cn\/cassava-chips$/);
  await expect(page.locator('header button.hmv-lang-trigger')).toHaveText('简体中文');
  await page.goBack();
  await expect(page).toHaveURL(/\/ko\/tapioca-chips$/);
  await expect(page.locator('header button.hmv-lang-trigger')).toHaveText('한국어');
  await page.goForward();
  await expect(page).toHaveURL(/\/zh-cn\/cassava-chips$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
});
