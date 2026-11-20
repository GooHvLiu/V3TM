import { mount } from "@vue/test-utils";
import { ElTooltip } from "element-plus/es";
import { nextTick } from "vue";
import { describe, expect, it } from "vitest";
import AppTooltip from "./index.vue";

const mountTooltip = (props: Record<string, unknown> = {}) =>
  mount(AppTooltip, {
    props,
    slots: { default: '<button type="button" class="tip-trigger">按钮</button>' },
    global: { components: { ElTooltip } },
    attachTo: document.body
  });

const flush = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe("appTooltip 运行时", () => {
  it("触发体照常渲染", () => {
    const wrapper = mountTooltip({ content: "切换语言" });

    expect(wrapper.find(".tip-trigger").exists()).toBe(true);
    wrapper.unmount();
  });

  it("默认浅色提示层，maxWidth 写到弹层宽度", async () => {
    const wrapper = mountTooltip({ content: "切换语言", showAfter: 0, maxWidth: 200 });

    await wrapper.find(".tip-trigger").trigger("mouseenter");
    await flush();

    const popper = document.body.querySelector(".el-popper");
    expect(popper?.getAttribute("class")).toContain("is-light");
    expect((popper as HTMLElement | null)?.style.maxWidth).toBe("200px");
    expect(document.body.textContent).toContain("切换语言");

    wrapper.unmount();
  });

  it("disabled 时不弹层", async () => {
    const wrapper = mountTooltip({ content: "切换语言", showAfter: 0, disabled: true });

    await wrapper.find(".tip-trigger").trigger("mouseenter");
    await flush();

    expect(document.body.querySelector(".el-popper")).toBeNull();
    wrapper.unmount();
  });
});
