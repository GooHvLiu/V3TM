import { describe, expect, it } from "vitest";
import { clearFormModel, isFieldDisabled, isFieldHidden, mergeFormRules, resolveFieldSpan, resolveFieldWidth } from "./helpers";
import type { ProFormField, ProFormModel } from "./types";

const fields: ProFormField[] = [
  { prop: "keyword", type: "input", rules: [{ required: true, message: "必填", trigger: "blur" }] },
  { prop: "status", type: "select", hidden: (model) => model.status === "hidden" },
  { prop: "typeCode", type: "input", disabled: (model) => model.locked === true }
];

describe("proForm helpers", () => {
  it("栅格跨度限制在 1-24，缺省按整行", () => {
    expect(resolveFieldSpan(undefined)).toBe(24);
    expect(resolveFieldSpan(0)).toBe(1);
    expect(resolveFieldSpan(25)).toBe(24);
    expect(resolveFieldSpan(12)).toBe(12);
  });

  it("字段显隐支持布尔值与模型函数", () => {
    expect(isFieldHidden(fields[1]!, { status: "hidden" })).toBe(true);
    expect(isFieldHidden(fields[1]!, { status: "normal" })).toBe(false);
    expect(isFieldHidden(fields[0]!, {})).toBe(false);
  });

  it("表单级禁用优先于字段配置", () => {
    expect(isFieldDisabled(fields[2]!, { locked: true })).toBe(true);
    expect(isFieldDisabled(fields[2]!, { locked: false })).toBe(false);
    expect(isFieldDisabled(fields[2]!, { locked: false }, true)).toBe(true);
  });

  it("控件宽度按数字补 px，字符串原样输出", () => {
    expect(resolveFieldWidth(200)).toBe("200px");
    expect(resolveFieldWidth("100%")).toBe("100%");
    expect(resolveFieldWidth(undefined)).toBeUndefined();
  });

  it("字段级规则追加在表单级规则之后", () => {
    const baseRule = [{ required: true, message: "表单必填", trigger: "blur" }];
    const merged = mergeFormRules(fields, { keyword: baseRule });

    expect(merged.keyword).toHaveLength(2);
    expect(merged.status).toBeUndefined();
  });

  it("重置查询模型只清空已配置字段", () => {
    const current: ProFormModel = { keyword: "abc", status: 1, page: 2 };

    expect(clearFormModel(fields, current)).toEqual({ keyword: "", status: undefined, typeCode: "", page: 2 });
  });

  it("区间字段重置为 null，文本字段清成空串", () => {
    const rangeFields: ProFormField[] = [
      { prop: "dateRange", type: "daterange" },
      { prop: "keyword", type: "input" }
    ];
    const current: ProFormModel = { dateRange: [new Date(), new Date()], keyword: "abc", page: 1 };

    expect(clearFormModel(rangeFields, current)).toEqual({ dateRange: null, keyword: "", page: 1 });
  });
});
