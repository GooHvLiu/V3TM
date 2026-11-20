/**
 * 用户管理 · 表单验证
 * 新增/编辑契约字段集不同
 */
import { z } from "zod";
import { isPasswordStrong } from "@/constants";

/** 新增用户 schema */
export const userCreateValidator = z.object({
  username: z
    .string()
    .min(3, { message: "users.dialog.message.usernameMin" })
    .max(20, { message: "users.dialog.message.usernameMax" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "users.dialog.message.usernameFormat" }),
  realName: z.string().min(2, { message: "users.dialog.message.realNameMin" }),
  email: z.string().email({ message: "users.dialog.message.emailInvalid" }),
  password: z.string().min(1, { message: "users.dialog.message.passwordPolicy" }).refine(isPasswordStrong, {
    message: "users.dialog.message.passwordPolicy"
  }),
  roleCodes: z.array(z.string()).min(1, { message: "users.dialog.message.roleRequired" })
});

/** 更新用户 schema */
export const userEditValidator = z.object({
  username: z
    .string()
    .min(3, { message: "users.dialog.message.usernameMin" })
    .max(20, { message: "users.dialog.message.usernameMax" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "users.dialog.message.usernameFormat" }),
  realName: z.string().min(2, { message: "users.dialog.message.realNameMin" }),
  email: z.string().email({ message: "users.dialog.message.emailInvalid" }),
  status: z.union([z.literal(0), z.literal(1)]),
  // 编辑可空密码：空 = 不修改；非空按改密强度校验，避免提交后被后端驳回
  password: z.string().refine((v) => v === "" || isPasswordStrong(v), {
    message: "users.dialog.message.passwordPolicy"
  }),
  roleCodes: z.array(z.string()).min(1, { message: "users.dialog.message.roleRequired" })
});
