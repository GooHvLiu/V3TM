/**
 * 字典中心 · 字典项表单验证
 * 新增/编辑契约字段集不同（新增 POST /v1/dict/data 不含 status）
 */
import { z } from "zod";

/** 新增字典项 schema */
export const dictDataCreateValidator = z.object({
  label: z.string().min(1, { message: "dicts.dialog.message.labelRequired" }),
  value: z.string().min(1, { message: "dicts.dialog.message.valueRequired" }),
  sort: z.number().min(0, { message: "dicts.dialog.message.sortRequired" })
});

/** 更新字典项 schema（PUT /v1/dict/data/{id} 含 status） */
export const dictDataEditValidator = z.object({
  label: z.string().min(1, { message: "dicts.dialog.message.labelRequired" }),
  value: z.string().min(1, { message: "dicts.dialog.message.valueRequired" }),
  sort: z.number().min(0, { message: "dicts.dialog.message.sortRequired" }),
  status: z.union([z.literal(0), z.literal(1)])
});
