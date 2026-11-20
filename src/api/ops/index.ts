/**
 * 运维任务 · 接口层
 * 权限码：superAdmin:taskCenter:list（列表）、superAdmin:task:run（执行）、superAdmin:task:danger（危险任务）
 * 约定：run 只有路径参数；reseed 只允许 confirm 一个字段
 */
import { http } from "@/utils/request";
import type { OpsTaskItem, OpsTaskRunResult } from "@/types";

enum API {
  TASKS = "/v1/super-admin/ops/tasks",
  // :key 为任务标识，调用前替换
  RUN = "/v1/super-admin/ops/tasks/:key/run",
  RESEED = "/v1/super-admin/ops/reseed"
}

/** 任务清单：固定四项，前端不做增删 */
export function fetchOpsTasks(): Promise<{ list: OpsTaskItem[] }> {
  return http.get<{ list: OpsTaskItem[] }>(API.TASKS);
}

/** 执行单个任务：只传路径参数，空对象用于满足 POST 必须带 body 的约束 */
export function runOpsTask(key: string): Promise<OpsTaskRunResult> {
  return http.post<OpsTaskRunResult>(API.RUN.replace(":key", key), {});
}

/** 种子数据重建：多传或少传字段都会判参数非法 */
export function reseed(): Promise<OpsTaskRunResult> {
  return http.post<OpsTaskRunResult>(API.RESEED, { confirm: "RESEED" });
}
