/**
 * 顶栏开关：主题落类、语言落 html lang
 */
import { expect, test } from "@playwright/test";

import { login } from "./utils/session";

test.describe("顶栏开关", () => {
  test("切到暗色后根元素带 dark", async ({ page }) => {
    await login(page, "superAdmin");
    // 桌面宽度下动作区平铺，语言与主题直接可见
    await page.locator(".theme").click();
    await page
      .locator(".el-dropdown-menu__item")
      .filter({ hasText: /暗色|Dark/ })
      .click();

    await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(true);
  });

  test("切到英文后 html lang 跟随", async ({ page }) => {
    await login(page, "superAdmin");
    await page.locator(".lang").click();
    await page
      .locator(".el-dropdown-menu__item")
      .filter({ hasText: /English|英文/ })
      .click();

    await expect(page.locator("html")).toHaveAttribute("lang", /en/);
  });
});
