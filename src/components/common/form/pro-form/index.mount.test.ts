import { mount } from "@vue/test-utils";
import { ElDatePicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch } from "element-plus/es";
import { describe, expect, it } from "vitest";
import ProForm from "./index.vue";
import type { ProFormField, ProFormModel } from "./types";

const mountForm = (modelValue: ProFormModel, fields: ProFormField[]) =>
  mount(ProForm, {
    props: { modelValue, fields },
    global: {
      components: { ElDatePicker, ElForm, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch }
    }
  });

describe("proForm 运行时", () => {
  it("输入变化以整份模型上抛", async () => {
    const wrapper = mountForm({ name: "旧值" }, [{ prop: "name", label: "名称", type: "input" }]);

    await wrapper.find("input").setValue("新值");

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toMatchObject({ name: "新值" });
    expect(wrapper.emitted("field-change")?.at(-1)).toEqual(["name", "新值"]);
  });

  it("隐藏字段不参与渲染", () => {
    const wrapper = mountForm({ mode: "simple" }, [
      { prop: "name", label: "名称" },
      { prop: "secret", label: "密级", hidden: (model) => model.mode === "simple" }
    ]);

    expect(wrapper.text()).toContain("名称");
    expect(wrapper.text()).not.toContain("密级");
  });
});
