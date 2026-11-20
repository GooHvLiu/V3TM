import { mount } from "@vue/test-utils";
import { ElAlert } from "element-plus/es";
import { describe, expect, it } from "vitest";
import AppAlert from "./index.vue";

const mountAlert = (props: Record<string, unknown> = {}) =>
  mount(AppAlert, { props, global: { components: { ElAlert } } });

describe("appAlert 运行时", () => {
  it("tone 为 danger 时落到 Element Plus 的 error 档", () => {
    const wrapper = mountAlert({ title: "保存失败", tone: "danger" });

    expect(wrapper.find(".el-alert--error").exists()).toBe(true);
    expect(wrapper.find(".app-alert--tone-danger").exists()).toBe(true);
  });

  it("warning 档位直传类型名并保留标题", () => {
    const wrapper = mountAlert({ title: "通知加载失败", tone: "warning" });

    expect(wrapper.find(".el-alert--warning").exists()).toBe(true);
    expect(wrapper.text()).toContain("通知加载失败");
  });

  it("默认不出现关闭按钮，closable 打开后才渲染", () => {
    const closed = mountAlert({ title: "提示" });
    expect(closed.find(".el-alert__close-btn").exists()).toBe(false);

    const closable = mountAlert({ title: "提示", closable: true });
    expect(closable.find(".el-alert__close-btn").exists()).toBe(true);
  });
});
