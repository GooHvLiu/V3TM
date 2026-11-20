import { describe, expect, it } from "vitest";
import { useFormServerErrors } from "./index";

const requestError = (overrides: Record<string, unknown> = {}): Error =>
  Object.assign(new Error("failed"), overrides);

describe("useFormServerErrors", () => {
  it("按 params.field 回填后端已翻译文案", () => {
    const { errors, apply } = useFormServerErrors(["code", "name"]);

    const result = apply(requestError({ params: { field: "code" }, translated: "角色编码已存在" }));

    expect(result).toEqual({ field: "code", message: "角色编码已存在" });
    expect(errors.value.code).toBe("角色编码已存在");
  });

  it("调用方指定的字段文案优先于后端文案", () => {
    const { errors, apply } = useFormServerErrors(["username"]);
    const messages = { username: "用户名已存在" };

    apply(requestError({ params: { field: "username" }, translated: "用户已存在" }), { messages });

    expect(errors.value.username).toBe("用户名已存在");
  });

  it("接口未给字段时可指定兜底字段", () => {
    const { errors, apply } = useFormServerErrors(["username"]);

    apply(requestError({ msg: "USER_ALREADY_EXIST", message: "用户已存在" }), { field: "username" });

    expect(errors.value.username).toBe("用户已存在");
  });

  it("白名单之外的字段不写入表单", () => {
    const { errors, apply } = useFormServerErrors(["code"]);

    const result = apply(requestError({ params: { field: "password" }, translated: "密码不合规" }));

    expect(result).toBeNull();
    expect(errors.value).toEqual({});
  });

  it("按字段或整体清除错误", () => {
    const { errors, apply, clear } = useFormServerErrors();

    apply(requestError({ params: { field: "code" }, translated: "编码已存在" }));
    apply(requestError({ params: { field: "name" }, translated: "名称已存在" }));

    clear("code");
    expect(errors.value).toEqual({ name: "名称已存在" });

    clear();
    expect(errors.value).toEqual({});
  });
});
