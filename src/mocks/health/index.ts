/**
 * 健康检查 · Mock 数据
 * 与后端 /v1/super-admin/health/checks、/v1/super-admin/health/probe 契约一致：
 * 单项状态 ok / warn / fail / skip，整体状态 up / degraded / down（skip 不参与判定）
 * 文案只给 key 与 params，由前端 i18n 渲染
 */
import type { HealthCheckItem, HealthReport } from "@/types";
import { mockError, parseBody } from "../utils";

/** 固定 6 项，顺序与后端 health.service.ts 一致 */
const CHECKS: HealthCheckItem[] = [
  { key: "database", labelKey: "health.database.label", status: "ok", durationMs: 12, messageKey: "health.database.ok", params: { durationMs: 12 } },
  {
    key: "memory",
    labelKey: "health.memory.label",
    status: "ok",
    durationMs: 3,
    messageKey: "health.memory.usage",
    params: { usedMB: 188.4, totalMB: 410.2, percent: 45.93, warnPercent: 70, failPercent: 85 }
  },
  {
    key: "disk",
    labelKey: "health.disk.label",
    status: "warn",
    durationMs: 5,
    messageKey: "health.disk.dirMissing",
    params: { dir: "/var/lib/app" }
  },
  { key: "logger", labelKey: "health.logger.label", status: "ok", durationMs: 2, messageKey: "health.logger.ok", params: { sizeMB: 2.1, limitMB: 20, history: 3, maxFiles: 5 } },
  { key: "helpIndex", labelKey: "health.helpIndex.label", status: "ok", durationMs: 18, messageKey: "health.helpIndex.ok", params: { total: 42 } },
  { key: "aiDependency", labelKey: "health.aiDependency.label", status: "skip", durationMs: 0, messageKey: "health.aiDependency.notConfigured" }
];

/** 整体状态判定（与后端一致：存在 fail → down；否则存在 warn → degraded；否则 up） */
const resolveStatus = (items: HealthCheckItem[]): HealthReport["status"] =>
  items.some((item) => item.status === "fail") ? "down" : items.some((item) => item.status === "warn") ? "degraded" : "up";

/** 按 keys 过滤后组装结果；不传 keys 即全量 */
const buildReport = (keys?: string[]): HealthReport => {
  const filtered = keys?.length ? CHECKS.filter((item) => keys.includes(item.key)) : CHECKS;
  // 与后端一致：传入的 key 全部无效时抛参数错误，字段指向 keys
  if (keys?.length && filtered.length === 0) throw mockError(10003, "PARAM_INVALID", { field: "keys" });
  const items = filtered.map((item) => ({ ...item }));
  return {
    status: resolveStatus(items),
    checkedAt: new Date().toISOString(),
    durationMs: items.reduce((sum, item) => sum + item.durationMs, 0),
    items
  };
};

/** GET /v1/super-admin/health/checks：keys 为逗号分隔字符串，缺省返回全部 */
export const mockHealthChecks = (config: { params?: { keys?: string } }): HealthReport => {
  const raw = config.params?.keys ?? "";
  return buildReport(raw ? raw.split(",").filter(Boolean) : undefined);
};

/** POST /v1/super-admin/health/probe：body { keys: string[] } */
export const mockHealthProbe = (config: { data?: unknown }): HealthReport => {
  const body = parseBody<{ keys?: string[] }>(config);
  return buildReport(body.keys);
};
