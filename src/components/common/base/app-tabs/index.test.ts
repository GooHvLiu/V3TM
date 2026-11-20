import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import AppTabs from "./index.vue";

interface Tab {
  label: string;
  value: string;
  badge?: string | number;
  tone?: "primary" | "danger";
}

const mountTabs = (items: Tab[]) =>
  mount(AppTabs, {
    props: { items },
    global: { plugins: [ElementPlus] }
  });

describe("app-tabs 页签", () => {
  it("计数渲染成标签内的胶囊，带 tone 修饰", () => {
    const wrapper = mountTabs([
      { label: "我的通知", value: "mine", badge: "99+", tone: "danger" },
      { label: "发送通知", value: "send" }
    ]);
    const badge = wrapper.find(".app-tabs__badge");
    expect(badge.exists()).toBe(true);
    expect(badge.text()).toBe("99+");
    expect(badge.classes()).toContain("app-tabs__badge--danger");
  });

  it("角标不再走 el-badge 的绝对定位", () => {
    const wrapper = mountTabs([{ label: "我的通知", value: "mine", badge: 3, tone: "danger" }]);
    expect(wrapper.find(".el-badge").exists()).toBe(false);
    expect(wrapper.find(".el-badge__content").exists()).toBe(false);
  });

  it("没有 badge 字段时不渲染胶囊", () => {
    const wrapper = mountTabs([{ label: "发送记录", value: "record" }]);
    expect(wrapper.find(".app-tabs__badge").exists()).toBe(false);
  });
});
