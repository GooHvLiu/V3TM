/**
 * 字典中心 · 字典类型表单验证
 * 新增/编辑契约字段集不同（编辑时 typeCode 不可改）
 */
import { z } from "zod";

/** 新增字典类型 schema */
export const dictTypeCreateValidator = z.object({
  typeCode: z
    .string()
    .min(2, { message: "dicts.dialog.message.typeCodeRequired" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "dicts.dialog.message.typeCodeFormat" }),
  typeName: z.string().min(2, { message: "dicts.dialog.message.typeNameMin" }),
  remark: z.string().max(200, { message: "dicts.dialog.message.remarkMax" }),
  status: z.union([z.literal(0), z.literal(1)])
});

/** 更新字典类型 schema */
export const dictTypeEditValidator = z.object({
  typeName: z.string().min(2, { message: "dicts.dialog.message.typeNameMin" }),
  remark: z.string().max(200, { message: "dicts.dialog.message.remarkMax" }),
  status: z.union([z.literal(0), z.literal(1)])
});
