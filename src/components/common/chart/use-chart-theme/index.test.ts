import { describe, expect, it, vi } from "vitest";

const { registerTheme } = vi.hoisted(() => ({ registerTheme: vi.fn() }));

vi.mock("../echarts", () => ({ registerTheme }));

import { buildChartTheme, buildPalette, ensureThemes, readToken } from "./index";

const setToken = (name: string, value: string): void => {
  document.documentElement.style.setProperty(name, value);
};

const clearTokens = (): void => {
  document.documentElement.removeAttribute("style");
};

describe("useChartTheme 令牌读取", () => {
  it("优先取当前主题下 CSS 变量实际值", () => {
    setToken("--color-primary", "#123456");

    expect(readToken("--color-primary", "#000000")).toBe("#123456");

    clearTokens();
  });

  it("变量缺席时回落到给定值", () => {
    expect(readToken("--color-not-exist", "#abcdef")).toBe("#abcdef");
  });

  it("调色板按语义色顺序取五项", () => {
    setToken("--color-primary", "#111111");
    setToken("--color-success", "#222222");
    setToken("--color-warning", "#333333");
    setToken("--color-danger", "#444444");
    setToken("--color-info", "#555555");

    expect(buildPalette()).toEqual(["#111111", "#222222", "#333333", "#444444", "#555555"]);

    clearTokens();
  });
});

describe("useChartTheme 主题组装", () => {
  it("背景透明，坐标轴与文字取令牌色", () => {
    setToken("--color-text-regular", "#606266");
    setToken("--color-border-light", "#e4e7ed");

    const theme = buildChartTheme(false) as {
      backgroundColor: string;
      valueAxis: { axisLine: { lineStyle: { color: string } } };
    };

    expect(theme.backgroundColor).toBe("transparent");
    expect(theme.valueAxis.axisLine.lineStyle.color).toBe("#e4e7ed");
    expect(buildPalette()).toHaveLength(5);

    clearTokens();
  });

  it("明暗两套各登记一次，重复调用不重复登记", () => {
    registerTheme.mockClear();

    ensureThemes();
    ensureThemes();

    expect(registerTheme).toHaveBeenCalledTimes(2);
  });
});
