import { http } from "@/utils/request";
import type { HealthReport } from "@/types";

enum API {
  HEALTH_CHECKS = "/v1/super-admin/health/checks",
  HEALTH_PROBE = "/v1/super-admin/health/probe"
}

/** 最近一次检查结果；不传 keys 即全量 6 项 */
export function fetchHealthChecks(keys?: string[]): Promise<HealthReport> {
  return http.get<HealthReport>(API.HEALTH_CHECKS, {
    params: keys?.length ? { keys: keys.join(",") } : undefined
  });
}

/** 立即探测：可只探测指定项（返回的 items 仅含选中项） */
export function probeHealth(keys: string[]): Promise<HealthReport> {
  return http.post<HealthReport>(API.HEALTH_PROBE, { keys });
}
