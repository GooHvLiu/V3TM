import { describe, expect, it } from "vitest";
import { createI18n } from "vue-i18n";
import { mount } from "@vue/test-utils";
import { ElButton, ElCheckbox } from "element-plus/es";
import ColumnSettings from "./index.vue";

const i18n = createI18n({
  legacy: false,
  locale: "zh-cn",
  messages: {
    "zh-cn": {
      common: { table: { columnSettings: "列设置", resetColumns: "重置列" } }
    }
  }
});

const items = [
  { prop: "id", label: "ID", checked: true, disabled: true },
  { prop: "name", label: "名称", checked: false },
  { prop: "status", label: "状态", checked: true }
];

const mountPanel = () =>
  mount(ColumnSettings, {
    props: { items },
    global: { plugins: [i18n], components: { ElCheckbox, ElButton } }
  });

describe("columnSettings", () => {
  it("按传入的条目逐行渲染，勾选状态来自 checked", () => {
    const wrapper = mountPanel();
    const boxes = wrapper.findAll(".el-checkbox");

    expect(boxes).toHaveLength(3);
    expect(boxes[0]?.text()).toBe("ID");
    expect(boxes[1]?.text()).toBe("名称");
    expect(boxes[0]?.classes()).toContain("is-checked");
    expect(boxes[1]?.classes()).not.toContain("is-checked");
  });

  it("禁用项不响应点击", async () => {
    const wrapper = mountPanel();

    await wrapper.findAll("input[type=checkbox]")[0]?.setValue(true);

    expect(wrapper.emitted("toggle")).toBeUndefined();
  });

  it("切换可见列时上抛列名与目标状态", async () => {
    const wrapper = mountPanel();

    await wrapper.findAll("input[type=checkbox]")[2]?.setValue(false);

    expect(wrapper.emitted("toggle")).toEqual([["status", false]]);
  });

  it("面板标为按钮组，重置按钮单独可点", async () => {
    const wrapper = mountPanel();
    const group = wrapper.find(".column-settings");

    expect(group.attributes("role")).toBe("group");
    expect(group.attributes("aria-label")).toBe("列设置");

    await wrapper.find(".column-settings__foot .el-button").trigger("click");

    expect(wrapper.emitted("reset")).toHaveLength(1);
  });
});
