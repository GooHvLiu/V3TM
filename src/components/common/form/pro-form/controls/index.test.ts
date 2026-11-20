import { mount } from "@vue/test-utils";
import { ElDatePicker, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch } from "element-plus/es";
import { describe, expect, it } from "vitest";
import ProFormControl from "./index.vue";
import type { ProFormField } from "../types";

const mountControl = (field: ProFormField, modelValue: unknown, disabled = false) =>
  mount(ProFormControl, {
    props: { field, modelValue, disabled },
    global: {
      components: { ElDatePicker, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch }
    }
  });

describe("proFormControl 运行时", () => {
  it("未声明类型时按输入框渲染，非字符串值收成文本", () => {
    const wrapper = mountControl({ prop: "name", label: "名称" }, 42);

    expect((wrapper.find("input").element as HTMLInputElement).value).toBe("42");
  });

  it("输入变更与回车提交各自上抛", async () => {
    const wrapper = mountControl({ prop: "name", label: "名称", type: "input" }, "旧值");

    await wrapper.find("input").setValue("新值");
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["新值"]);

    await wrapper.find("input").trigger("keyup.enter");
    expect(wrapper.emitted("submit")).toHaveLength(1);
  });

  it("五类扩展控件都落到对应容器", () => {
    const select = mountControl(
      { prop: "status", label: "状态", type: "select", options: [{ label: "启用", value: 1 }] },
      1
    );
    const switchControl = mountControl({ prop: "enabled", label: "启用", type: "switch" }, true);
    const number = mountControl({ prop: "count", label: "数量", type: "number" }, 3);
    const range = mountControl({ prop: "createdAt", label: "创建时间", type: "daterange" }, null);

    expect(select.find(".el-select").exists()).toBe(true);
    expect(switchControl.find(".el-switch").exists()).toBe(true);
    expect(number.find(".el-input-number").exists()).toBe(true);
    expect(range.find(".el-date-editor").exists()).toBe(true);
  });

  it("禁用态透传到控件", () => {
    const wrapper = mountControl({ prop: "enabled", label: "启用", type: "switch" }, true, true);

    expect(wrapper.find(".el-switch").classes()).toContain("is-disabled");
  });

  it("每个控件都带可访问名称，日期区间落到起止两个输入", () => {
    const range = mountControl({ prop: "createdAt", label: "创建时间", type: "daterange" }, null);
    const input = mountControl({ prop: "name", label: "名称", type: "input" }, "");
    const withPlaceholder = mountControl({ prop: "keyword", label: "", placeholder: "搜索对象" }, "");
    const select = mountControl(
      { prop: "status", label: "状态", type: "select", options: [{ label: "启用", value: 1 }] },
      1
    );
    const switchControl = mountControl({ prop: "enabled", label: "启用", type: "switch" }, true);
    const number = mountControl({ prop: "count", label: "数量", type: "number" }, 3);

    const rangeNames = range.findAll("input").map((item) => item.attributes("aria-label"));
    expect(rangeNames).toEqual(["创建时间", "创建时间"]);
    expect(input.find("input").attributes("aria-label")).toBe("名称");
    expect(withPlaceholder.find("input").attributes("aria-label")).toBe("搜索对象");
    expect(select.find('[role="combobox"]').attributes("aria-label")).toBe("状态");
    expect(switchControl.find('[role="switch"]').attributes("aria-label")).toBe("启用");
    expect(number.find("input").attributes("aria-label")).toBe("数量");
  });
});
