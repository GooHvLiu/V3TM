import { describe, expect, it } from "vitest";

import { BREAKPOINTS } from "@/constants";

import { resolveBreakpoint, resolveScreen } from "./index";

describe("resolveScreen", () => {
  it("按各档上界的半开区间分段", () => {
    const cases: Array<[number, string]> = [
      [320, "xs"],
      [BREAKPOINTS.XS_MAX - 1, "xs"],
      [BREAKPOINTS.XS_MAX, "sm"],
      [BREAKPOINTS.SM_MAX - 1, "sm"],
      [BREAKPOINTS.SM_MAX, "md"],
      [BREAKPOINTS.MD_MAX - 1, "md"],
      [BREAKPOINTS.MD_MAX, "lg"],
      [BREAKPOINTS.LG_MAX - 1, "lg"],
      [BREAKPOINTS.LG_MAX, "xl"],
      [BREAKPOINTS.XL_MAX - 1, "xl"],
      [BREAKPOINTS.XL_MAX, "2xl"],
      [1920, "2xl"]
    ];

    for (const [width, expected] of cases) {
      expect(resolveScreen(width), `${width}px`).toBe(expected);
    }
  });
});

describe("resolveBreakpoint", () => {
  it("六档归到三端", () => {
    expect(resolveBreakpoint("xs")).toBe("mobile");
    expect(resolveBreakpoint("sm")).toBe("mobile");
    expect(resolveBreakpoint("md")).toBe("mobile");
    expect(resolveBreakpoint("lg")).toBe("tablet");
    expect(resolveBreakpoint("xl")).toBe("tablet");
    expect(resolveBreakpoint("2xl")).toBe("desktop");
  });

  it("端边界与布局层的 768 / 1200 保持一致", () => {
    expect(resolveBreakpoint(resolveScreen(BREAKPOINTS.MD_MAX - 1))).toBe("mobile");
    expect(resolveBreakpoint(resolveScreen(BREAKPOINTS.MD_MAX))).toBe("tablet");
    expect(resolveBreakpoint(resolveScreen(BREAKPOINTS.XL_MAX - 1))).toBe("tablet");
    expect(resolveBreakpoint(resolveScreen(BREAKPOINTS.XL_MAX))).toBe("desktop");
  });
});
