/** 注册表单校验 schema：规则单点维护，错误消息存 i18n key */
import { z } from "zod";
import { isPasswordStrong } from "@/constants";

export const registerValidator = z
  .object({
    realName: z.string().min(1, "auth.message.realNameEmpty").max(50, "auth.message.realNameTooLong"),
    username: z
      .string()
      .min(1, "auth.message.nameEmpty")
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/, "auth.message.incorrectUsername"),
    email: z
      .string()
      .min(1, "auth.message.emailEmpty")
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "auth.message.incorrectEmail"),
    // 与后端强度校验同口径：8-32 位，四类字符至少三类
    psw: z
      .string()
      .min(1, "auth.message.pswEmpty")
      .refine((value) => isPasswordStrong(value), "auth.message.passwordWeak"),
    confirmPsw: z.string().min(1, "auth.message.pswEmpty")
  })
  .superRefine((data, ctx) => {
    // 跨字段规则：两次密码必须一致（错误精准挂在 confirmPsw 上）
    if (data.psw !== data.confirmPsw) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPsw"],
        message: "auth.message.confirmPsw"
      });
    }
  });

/** 注册表单类型：由 schema 推断 */
export type RegisterFormModel = z.infer<typeof registerValidator>;
