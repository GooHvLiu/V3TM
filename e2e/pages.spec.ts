/**
 * 列表与表单契约：搜索收敛结果、空提交给出字段级提示
 */
import { expect, test } from "@playwright/test";

import { login } from "./utils/session";

const TABLE_ROWS = ".page-wrap-pro-table .el-table__body-wrapper tbody tr";

test.describe("用户中心", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "superAdmin");
    await page.goto("/admin-center/user-center");
    await expect(page.locator(TABLE_ROWS).first()).toBeVisible({ timeout: 15_000 });
  });

  test("按账号搜索后只剩一条记录", async ({ page }) => {
    const search = page.locator(".pro-search");
    await search.locator("input").first().fill("zhangjian");
    await search.locator("button").first().click();

    await expect(page.locator(TABLE_ROWS)).toHaveCount(1, { timeout: 10_000 });
  });

  test("新增用户空提交给出字段级提示", async ({ page }) => {
    await page.getByRole("button", { name: "新增用户" }).click();
    const dialog = page.locator(".el-dialog");
    await expect(dialog).toBeVisible();

    await dialog.locator(".el-dialog__footer button").nth(1).click();
    await expect(dialog.locator(".el-form-item__error").first()).toBeVisible();

    const errors = await dialog.locator(".el-form-item__error").count();
    expect(errors).toBeGreaterThanOrEqual(3);
  });
});
