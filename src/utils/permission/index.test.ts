import { describe, expect, it } from "vitest";
import { hasPermission } from "./index";

describe("hasPermission", () => {
  it("超级权限直接放行", () => {
    expect(hasPermission(["*:*:*"], "user:add")).toBe(true);
    expect(hasPermission(["*"], ["user:add", "user:delete"])).toBe(true);
  });

  it("单权限按全等匹配", () => {
    expect(hasPermission(["user:add"], "user:add")).toBe(true);
    expect(hasPermission(["user:add"], "user:delete")).toBe(false);
  });

  it("权限数组任一命中即通过", () => {
    expect(hasPermission(["user:add", "user:delete"], ["order:list", "user:add"])).toBe(true);
    expect(hasPermission(["order:list"], ["user:add", "user:delete"])).toBe(false);
  });

  it("空权限列表不放行", () => {
    expect(hasPermission([], "user:add")).toBe(false);
    expect(hasPermission([], ["user:add"])).toBe(false);
  });
});
