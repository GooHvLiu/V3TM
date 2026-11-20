/**
 * 窄屏适配：顶栏动作收纳、页面不出现横向滚动
 */
import { expect, test } from "@playwright/test";

import { login } from "./utils/session";

test.describe("手机端 375", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("通知、语言、主题收进更多菜单", async ({ page }) => {
    await login(page, "superAdmin");

    await expect(page.locator(".page-wrap-header-more")).toBeVisible();
    await expect(page.locator(".page-wrap-header-lang")).toHaveCount(0);
    await expect(page.locator(".page-wrap-header-theme")).toHaveCount(0);
  });

  test("看板与用户中心不横向溢出", async ({ page }) => {
    await login(page, "superAdmin");

    for (const path of ["/dashboard", "/admin-center/user-center"]) {
      await page.goto(path);
      await page.waitForTimeout(500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${path} 横向溢出 ${overflow}px`).toBeLessThanOrEqual(0);
    }
  });
});
