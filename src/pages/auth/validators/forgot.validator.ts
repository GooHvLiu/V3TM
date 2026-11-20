/** 忘记密码两段表单校验：规则单点维护，错误消息存 i18n key */
import { z } from "zod";
import { FORGOT_CODE_LENGTH, isPasswordStrong } from "@/constants";

/** 第 1 步：验证账号。用户名按后端 3–50 长度，不套登录页那条正则 */
export const forgotAccountValidator = z.object({
  username: z
    .string()
    .min(1, "auth.forgot.errors.usernameEmpty")
    .min(3, "auth.forgot.errors.usernameLength")
    .max(50, "auth.forgot.errors.usernameLength"),
  email: z
    .string()
    .min(1, "auth.forgot.errors.emailEmpty")
    .max(100, "auth.forgot.errors.emailLength")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "auth.forgot.errors.emailInvalid"),
  captcha: z.string().min(1, "auth.forgot.errors.captchaEmpty").length(4, "auth.forgot.errors.captchaLength")
});

/** 第 2 步：重置密码。确认密码不一致的错误挂在 confirmPsw 上 */
export const forgotResetValidator = z
  .object({
    code: z.string().regex(new RegExp(`^\\d{${FORGOT_CODE_LENGTH}}$`), "auth.forgot.errors.codeFormat"),
    password: z
      .string()
      .min(1, "auth.forgot.errors.passwordWeak")
      .refine((value) => isPasswordStrong(value), "auth.forgot.errors.passwordWeak"),
    confirmPsw: z.string().min(1, "auth.forgot.errors.confirmEmpty")
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPsw) {
      ctx.addIssue({ code: "custom", path: ["confirmPsw"], message: "auth.forgot.errors.confirmMismatch" });
    }
  });
