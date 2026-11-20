import { describe, expect, it, vi } from "vitest";
import { translateMessage } from "./request";

describe("request translateMessage", () => {
  it("已知错误码走 i18n 文案", () => {
    expect(translateMessage("NETWORK_ERROR")).toBe("网络异常");
    expect(translateMessage("USER_PASSWORD_ERROR")).toBe("密码错误");
  });

  it("未知错误码回退为 UNKNOWN_ERROR", () => {
    // 缺键告警是被测行为的一部分，断言结果即可，不把 i18n 提示混进测试输出
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    try {
      expect(translateMessage("NOT_A_REAL_CODE")).toBe("未知错误");
    } finally {
      warn.mockRestore();
    }
  });

  it("字段参数追加可读字段名", () => {
    expect(translateMessage("PARAM_ERROR", { field: "form.username" })).toBe("参数错误：用户名");
  });
});
