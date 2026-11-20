/**
 * 看板 · 模拟数据
 * 条数取固定种子，日期按当天回推：同一会话内反复刷新读数不变
 */
import dayjs from "dayjs";

import type { DashboardTrend } from "@/types";

/** 七日条数种子，从最早一天开始 */
const DAY_COUNTS = [128, 96, 154, 132, 187, 76, 143];

export const mockDashboardTrend = (): DashboardTrend => ({
  points: DAY_COUNTS.map((count, offset) => ({
    date: dayjs()
      .subtract(DAY_COUNTS.length - 1 - offset, "day")
      .format("YYYY-MM-DD"),
    count
  }))
});
