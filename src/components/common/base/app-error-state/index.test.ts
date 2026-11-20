import { mount } from "@vue/test-utils";
import { ElButton, ElIcon } from "element-plus/es";
import { describe, expect, it } from "vitest";
import AppButton from "../app-button/index.vue";
import AppErrorState from "./index.vue";

const mountState = (props: Record<string, unknown> = {}) =>
  mount(AppErrorState, {
    props,
    /* app-button 内部依赖全局注册的 el-button，挂载测试里要显式补上 */
    global: { components: { AppButton, ElButton, ElIcon } }
  });

describe("appErrorState 运行时", () => {
  it("没有语言包时用中文兜底文案", () => {
    const wrapper = mountState();

    expect(wrapper.find(".app-error-state__title").text()).toBe("加载失败");
    expect(wrapper.find(".app-error-state__description").text()).toBe("请检查网络或稍后重试");
    expect(wrapper.findAll("button")).toHaveLength(1);
  });

  it("标题传空串时隐藏，错误码单独成行", () => {
    const wrapper = mountState({ title: "", code: 500 });

    expect(wrapper.find(".app-error-state__title").exists()).toBe(false);
    expect(wrapper.find(".app-error-state__code").text()).toBe("错误码 500");
  });

  it("重试与返回首页各自上抛", async () => {
    const wrapper = mountState({ showHome: true });
    const buttons = wrapper.findAll("button");

    await buttons[0].trigger("click");
    await buttons[1].trigger("click");

    expect(buttons).toHaveLength(2);
    expect(wrapper.emitted("retry")).toHaveLength(1);
    expect(wrapper.emitted("home")).toHaveLength(1);
  });

  it("关闭重试且不展示首页时不留操作按钮", () => {
    const wrapper = mountState({ showRetry: false });

    expect(wrapper.findAll("button")).toHaveLength(0);
  });
});
