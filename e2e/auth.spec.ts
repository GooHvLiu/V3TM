/**
 * 登录落地与角色菜单：两个 mock 账号在侧栏能看到的范围不同
 */
import { expect, test } from "@playwright/test";

import { login } from "./utils/session";

test.describe("登录与角色菜单", () => {
  test("超级管理员落在看板，侧栏含超级面板", async ({ page }) => {
    await login(page, "superAdmin");
    const sidebar = page.locator(".page-wrap-sidebar-menu");

    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    await expect(sidebar.getByText("我的看板")).toBeVisible();
    // 分组标签与目录标题同名，按标签节点断言更准
    await expect(sidebar.locator(".label").filter({ hasText: "超级面板" })).toBeVisible();
  });

  test("管理员看不到超级面板与超级设置", async ({ page }) => {
    await login(page, "admin");
    const sidebar = page.locator(".page-wrap-sidebar-menu");

    await expect(sidebar).toBeVisible({ timeout: 15_000 });
    // 管理中心是父级目录，默认收起，只断标题可见
    await expect(sidebar.getByText("管理中心")).toBeVisible();
    await expect(sidebar.getByText("超级面板")).toHaveCount(0);
    await expect(sidebar.getByText("超级设置")).toHaveCount(0);
  });
});
