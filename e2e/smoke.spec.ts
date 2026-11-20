import { expect, test } from "@playwright/test";

test.describe("登录页冒烟", () => {
  test("未登录访问受保护页面会回到登录页", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    await expect(page.locator(".page-wrap-login-form")).toBeVisible();
  });

  test("登录表单渲染用户名、密码、验证码与提交按钮", async ({ page }) => {
    await page.goto("/auth/login");
    const form = page.locator(".page-wrap-login-form");
    await expect(form.locator("input")).toHaveCount(3);
    await expect(form.locator(".submitBtn")).toBeVisible();
    await expect(page.locator(".auth-card .el-card")).toBeVisible();
  });

  test("空表单提交给出三条字段提示", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator(".page-wrap-login-form .submitBtn").click();
    await expect(page.locator(".el-form-item__error")).toHaveCount(3);
  });

  test("深色模式下卡片不再显示白底", async ({ page }) => {
    await page.goto("/auth/login");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    const bg = await page.locator(".auth-card .el-card").evaluate((el) => getComputedStyle(el).backgroundColor);
    const channels = bg.match(/\d+/g)?.map(Number) ?? [];
    expect(channels[0]).toBeLessThan(80);
    expect(channels[1]).toBeLessThan(80);
    expect(channels[2]).toBeLessThan(80);
  });
});
