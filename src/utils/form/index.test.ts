import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodToErrors, zodToRules } from "./index";

const schema = z
  .object({
    name: z.string().trim().min(2, { message: "form.nameMin" }),
    code: z.string().min(1, { message: "form.codeRequired" })
  })
  .superRefine((value, ctx) => {
    if (value.code === "ADMIN") ctx.addIssue({ code: "custom", path: ["name"], message: "form.nameReserved" });
  });

const t = (key: string): string => `t:${key}`;

describe("zodToRules", () => {
  it("每个字段生成一条规则，并在失焦与变更时触发", () => {
    const rules = zodToRules(schema, t);

    expect(Object.keys(rules)).toEqual(["name", "code"]);
    expect(rules.name?.[0]?.trigger).toEqual(["blur", "change"]);
  });
});

describe("zodToErrors", () => {
  it("整体校验后按字段汇总错误并翻译", () => {
    const errors = zodToErrors(schema, { name: "a", code: "" }, t);

    expect(errors.name).toBe("t:form.nameMin");
    expect(errors.code).toBe("t:form.codeRequired");
  });

  it("同一字段只保留第一条错误", () => {
    const errors = zodToErrors(schema, { name: "a", code: "ADMIN" }, t);

    expect(errors.name).toBe("t:form.nameMin");
  });

  it("跨字段规则命中时覆盖到对应字段", () => {
    expect(zodToErrors(schema, { name: "管理员", code: "ADMIN" }, t)).toEqual({
      name: "t:form.nameReserved"
    });
  });

  it("通过校验时返回空对象", () => {
    expect(zodToErrors(schema, { name: "管理员", code: "USER" }, t)).toEqual({});
  });
});
