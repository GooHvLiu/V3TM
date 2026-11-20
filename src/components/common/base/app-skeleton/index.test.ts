import { mount } from "@vue/test-utils";
import { ElSkeleton, ElSkeletonItem } from "element-plus/es";
import { describe, expect, it } from "vitest";
import AppSkeleton from "./index.vue";

const mountSkeleton = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(AppSkeleton, {
    props,
    slots,
    global: { components: { ElSkeleton, ElSkeletonItem } }
  });

describe("appSkeleton 运行时", () => {
  it("list 形态按 rows 生成行数", () => {
    const wrapper = mountSkeleton({ variant: "list", rows: 2 });

    expect(wrapper.findAll(".app-skeleton__list-row")).toHaveLength(2);
  });

  it("table 形态保留表头并跟随 rows", () => {
    const wrapper = mountSkeleton({ variant: "table", rows: 2 });

    expect(wrapper.find(".app-skeleton__table-head").exists()).toBe(true);
    expect(wrapper.findAll(".app-skeleton__table-row")).toHaveLength(2);
  });

  it("chart 形态给出绘图区与横轴占位", () => {
    const wrapper = mountSkeleton({ variant: "chart", rows: 7 });

    expect(wrapper.find(".app-skeleton__chart-area").exists()).toBe(true);
    expect(wrapper.findAll(".app-skeleton__chart-axis .el-skeleton__item")).toHaveLength(7);
  });

  it("loading 关闭后交回默认插槽", () => {
    const wrapper = mountSkeleton({ loading: false }, { default: '<p class="slot-content">内容</p>' });

    expect(wrapper.find(".slot-content").exists()).toBe(true);
    expect(wrapper.find(".app-skeleton__text").exists()).toBe(false);
  });
});
