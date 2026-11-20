import { mount } from "@vue/test-utils";
import { ElEmpty } from "element-plus/es";
import { beforeEach, describe, expect, it, vi } from "vitest";

/* init 需要真实 canvas，测试环境里换成可观测的替身，只验证调用契约 */
const { chart, init } = vi.hoisted(() => {
  const chart = { setOption: vi.fn(), resize: vi.fn(), dispose: vi.fn() };
  const init = vi.fn((_dom: unknown, _theme: unknown, _options?: unknown) => chart);
  return { chart, init };
});

vi.mock("../echarts", () => ({ init, registerTheme: vi.fn() }));

import BaseChart from "./index.vue";
import type { EChartsOption } from "../echarts";

const option: EChartsOption = { series: [{ type: "line", data: [1, 2, 3] }] };

const mountChart = (props: Record<string, unknown> = {}) =>
  mount(BaseChart, {
    props: { option, ...props },
    global: { components: { ElEmpty } }
  });

describe("baseChart 运行时", () => {
  beforeEach(() => {
    init.mockClear();
    chart.setOption.mockClear();
    chart.dispose.mockClear();
  });

  it("挂载后按当前主题初始化并灌入配置", () => {
    const wrapper = mountChart();

    expect(init).toHaveBeenCalledTimes(1);
    expect(init.mock.calls[0][2]).toEqual({ renderer: "canvas" });
    expect(chart.setOption).toHaveBeenCalledWith(option, { notMerge: true });
    expect(wrapper.find(".base-chart__canvas").attributes("role")).toBe("img");
  });

  it("配置变化只重灌数据，不重建实例", async () => {
    const wrapper = mountChart();

    await wrapper.setProps({ option: { series: [{ type: "line", data: [4, 5] }] } });

    expect(init).toHaveBeenCalledTimes(1);
    expect(chart.setOption).toHaveBeenCalledTimes(2);
    expect(chart.setOption.mock.calls[1][0]).toEqual({ series: [{ type: "line", data: [4, 5] }] });
  });

  it("空态不建实例，交给空态占位", () => {
    const wrapper = mountChart({ empty: true });

    expect(init).not.toHaveBeenCalled();
    expect(wrapper.find(".el-empty").exists()).toBe(true);
    expect(wrapper.find(".base-chart__canvas").exists()).toBe(false);
  });

  it("卸载后释放实例", () => {
    const wrapper = mountChart();

    wrapper.unmount();

    expect(chart.dispose).toHaveBeenCalledTimes(1);
  });
});
