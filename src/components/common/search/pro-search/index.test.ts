import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createI18n } from "vue-i18n";
import { describe, expect, it } from "vitest";
import ProSearch from "./index.vue";
import type { ProFormField } from "@/components/common/form/pro-form/types";

const fields: ProFormField[] = [
  { prop: "keyword", label: "关键字", type: "input" },
  { prop: "status", label: "状态", type: "select" },
  { prop: "owner", label: "负责人", type: "input" },
  { prop: "createdAt", label: "创建时间", type: "daterange" }
];

const i18n = createI18n({
  legacy: false,
  locale: "zh-cn",
  messages: {
    "zh-cn": {
      search: { search: "搜索", reset: "重置", expand: "展开", collapse: "收起" }
    }
  }
});

const mountSearch = () =>
  mount(ProSearch, {
    props: { modelValue: { keyword: "abc", status: 1, page: 2 }, fields },
    global: { plugins: [ElementPlus, i18n] }
  });

describe("proSearch 运行时", () => {
  it("默认只展示前三个字段，展开后全部展示", async () => {
    const wrapper = mountSearch();

    expect(wrapper.findAll(".el-form-item")).toHaveLength(3);

    await wrapper.findAll("button").find((button) => button.text() === "展开")!.trigger("click");
    expect(wrapper.findAll(".el-form-item")).toHaveLength(4);
  });

  it("重置清空已配置字段并保留分页等其他键", async () => {
    const wrapper = mountSearch();

    await wrapper.findAll("button").find((button) => button.text() === "重置")!.trigger("click");

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toEqual({
      keyword: "",
      status: undefined,
      owner: "",
      createdAt: null,
      page: 2
    });
    expect(wrapper.emitted("reset")).toHaveLength(1);
  });
});
