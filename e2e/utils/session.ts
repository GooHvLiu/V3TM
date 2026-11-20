/**
 * e2e 共用动作：用 mock 账号从登录页走一遍表单
 * 不直接写 token，顺带把表单校验与登录跳转一起验到
 */
import { expect, type Page } from "@playwright/test";

export const ACCOUNTS = {
  superAdmin: { username: "superAdmin", password: "superAdmin123456@" },
  admin: { username: "admin", password: "admin123456@" }
} as const;

export type AccountKey = keyof typeof ACCOUNTS;

export async function login(page: Page, key: AccountKey): Promise<void> {
  const { username, password } = ACCOUNTS[key];

  await page.goto("/auth/login");
  const form = page.locator(".page-wrap-login-form");
  // 首次进页面要等 vite 编译与首帧挂载，给足冷启动时间
  await expect(form).toBeVisible({ timeout: 20_000 });

  await form.locator("input").nth(0).fill(username);
  await form.locator("input").nth(1).fill(password);
  // mock 不校验验证码内容，表单只要求非空
  await form.locator("input").nth(2).fill("abcd");

  await form.locator(".submitBtn").click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  // 顶栏在所有端形态都渲染，用它判断布局已挂载
  await expect(page.locator(".page-wrap-header-actions")).toBeVisible({ timeout: 15_000 });
}
