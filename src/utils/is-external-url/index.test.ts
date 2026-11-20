import { describe, expect, it } from "vitest";
import { isExternalUrl } from "./index";

describe("isExternalUrl", () => {
  it("协议前缀的地址判为外链", () => {
    expect(isExternalUrl("https://github.com/GooHvLiu/V3TM")).toBe(true);
    expect(isExternalUrl("http://example.com")).toBe(true);
    expect(isExternalUrl("mailto:example@example.com")).toBe(true);
    expect(isExternalUrl("tel:+8610000000000")).toBe(true);
    expect(isExternalUrl("www.example.com")).toBe(true);
  });

  it("站内路由与相对地址不算外链", () => {
    expect(isExternalUrl("/dashboard")).toBe(false);
    expect(isExternalUrl("dashboard")).toBe(false);
    expect(isExternalUrl("#anchor")).toBe(false);
    expect(isExternalUrl("")).toBe(false);
  });
});
