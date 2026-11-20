/** 登录表单校验 schema：规则单点维护，错误消息存 i18n key */

// 引入 zod
import { z } from "zod";

export const loginValidator = z.object({
  username: z
    .string()
    .min(1, "auth.message.nameEmpty")
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]{2,19}$/, "auth.message.incorrectUsername"),
  psw: z.string().min(1, "auth.message.pswEmpty"),
  captcha: z.string().min(1, "auth.message.captchaEmpty")
});

/** 登录表单类型：由 schema 推断 */
export type LoginFormModel = z.infer<typeof loginValidator>;
