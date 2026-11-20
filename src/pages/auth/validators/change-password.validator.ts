/** 强制改密表单校验：规则单点维护，错误消息存 i18n key */
import { z } from "zod";
import { OLD_PASSWORD_MAX, isPasswordStrong } from "@/constants";

export const changePasswordValidator = z
  .object({
    // 首次改密同样要填旧密码：管理员下发的初始密码
    oldPassword: z
      .string()
      .min(1, "auth.force.errors.oldEmpty")
      .max(OLD_PASSWORD_MAX, "auth.force.errors.oldTooLong"),
    newPassword: z
      .string()
      .min(1, "auth.force.errors.passwordWeak")
      .refine((value) => isPasswordStrong(value), "auth.force.errors.passwordWeak"),
    confirmPassword: z.string().min(1, "auth.force.errors.confirmEmpty")
  })
  .superRefine((data, ctx) => {
    // 跨字段规则挂到对应输入框，避免错误落到整表
    if (data.newPassword && data.newPassword === data.oldPassword) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: "auth.force.errors.sameAsOld" });
    }
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "auth.force.errors.confirmMismatch" });
    }
  });
