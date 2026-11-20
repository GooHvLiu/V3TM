/**
 * 角色管理 · 表单验证
 * 新增/编辑契约字段集不同
 */
import { z } from "zod";

/** 新增角色 schema */
export const roleCreateValidator = z.object({
  code: z
    .string()
    .min(2, { message: "roles.dialog.message.codeRequired" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "roles.dialog.message.codeFormat" }),
  name: z.string().min(2, { message: "roles.dialog.message.nameMin" }),
  description: z.string().max(200, { message: "roles.dialog.message.descriptionMax" }),
  status: z.union([z.literal(0), z.literal(1)]),
  menuIds: z.array(z.number())
});

/** 更新角色 schema */
export const roleEditValidator = z.object({
  name: z.string().min(2, { message: "roles.dialog.message.nameMin" }),
  description: z.string().max(200, { message: "roles.dialog.message.descriptionMax" }),
  status: z.union([z.literal(0), z.literal(1)]),
  menuIds: z.array(z.number())
});
