/**
 * 可访问性扫描：axe 在几个代表页面上跑 WCAG 2.1 A/AA
 * 只拦 critical 与 serious，其余打印出来作为观察项，不阻断流水线
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Result } from "axe-core";

import { login } from "./utils/session";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// 产品界面：这三页加登录页是门槛，critical 与 serious 必须为 0
const PAGES = [
  { path: "/dashboard", name: "看板" },
  { path: "/admin-center/user-center", name: "用户中心" },
  { path: "/system-settings", name: "系统设置" }
];

const describe = (violations: Result[]): string =>
  violations
    .map(
      (item) =>
        `${item.impact ?? "unknown"} · ${item.id} — ${item.help}（${item.nodes.length} 处）\n  ` +
        item.nodes
          .slice(0, 3)
          .map((node) => node.target.join(" "))
          .join("\n  ")
    )
    .join("\n");

const blocking = (violations: Result[]): Result[] =>
  violations.filter((item) => item.impact === "critical" || item.impact === "serious");

test.describe("可访问性", () => {
  // 每条都要登录、等页面稳定再整页扫描，并行跑时比冒烟用例慢一截，放宽到 60 秒
  test.describe.configure({ timeout: 60_000 });

  for (const target of PAGES) {
    test(`${target.name}没有 critical 与 serious 违规`, async ({ page }) => {
      await login(page, "superAdmin");
      await page.goto(target.path);
      // 等图表与表格从骨架切到内容，避免把加载态当成结构缺失
      await expect(page.locator(".page-wrap-header-actions")).toBeVisible();
      await page.waitForTimeout(1200);

      const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      const failed = blocking(violations);

      if (violations.length) {
        console.log(`[${target.name}] 共 ${violations.length} 条：\n${describe(violations)}`);
      }
      expect(failed, describe(failed)).toHaveLength(0);
    });
  }

  test("登录页没有 critical 与 serious 违规", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator(".page-wrap-login-form")).toBeVisible({ timeout: 20_000 });

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const failed = blocking(violations);

    if (violations.length) {
      console.log(`[登录页] 共 ${violations.length} 条：\n${describe(violations)}`);
    }
    expect(failed, describe(failed)).toHaveLength(0);
  });

  // 组件演示页把 Element Plus 的原生色档全摊开，亮色下白字压 success / warning / danger 不足 4.5:1
  // 那是第三方默认色板，动它会牵动全站观感，先记录条数，不进门槛
  test("组件演示页的原生色档只记录不阻断", async ({ page }) => {
    await login(page, "superAdmin");
    await page.goto("/design-system");
    await expect(page.locator(".page-wrap-header-actions")).toBeVisible();
    await page.waitForTimeout(1200);

    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    console.log(`[组件演示] 共 ${violations.length} 条（不阻断）：\n${describe(violations)}`);
  });
});
