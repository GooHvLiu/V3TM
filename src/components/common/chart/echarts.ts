/**
 * 图表运行时：按需登记，控制打包体积
 * 只登记项目实际用到的图表与组件，扩图表类型时在此追加
 */
import { BarChart, LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([CanvasRenderer, LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent]);

export { init, registerTheme } from "echarts/core";
export type { EChartsType } from "echarts/core";
export type { EChartsOption } from "echarts";
