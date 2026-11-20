/**
 * 看板 · 数据类型
 * 图表侧只消费聚合后的点，原始明细留在日志中心，避免看板拉全量
 */

/** 趋势点：一天一条 */
export interface DashboardTrendPoint {
  /** 日期，YYYY-MM-DD */
  date: string;
  /** 当日操作条数 */
  count: number;
}

/** 趋势序列：按日期升序 */
export interface DashboardTrend {
  points: DashboardTrendPoint[];
}
