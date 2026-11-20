/**
 * 认证 · Mock 忘记密码
 * 图形码与邮箱码都在本模块闭环：图形码一次性、过期即失效，邮箱码固定通过并累计失败次数
 */
import type { AxiosRequestConfig } from "axios";
import { parseBody } from "../utils";

/** 图形码字符池：剔除 0/O、1/I 等易混字符，与后端口径一致 */
const CAPTCHA_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** 图形码一次性：生成即入池，校验通过即销毁，id 不在池中按过期处理 */
const captchaPool = new Map<string, string>();
let captchaSeq = 0;

const buildCaptchaSvg = (code: string): string => {
  const chars = code
    .split("")
    .map((char, index) => `<text x="${14 + index * 22}" y="22" font-size="18" fill="#409eff">${char}</text>`)
    .join("");
  return `<svg xmlns='http://www.w3.org/2000/svg' width='100' height='32'><rect width='100' height='32' fill='#f0f2f5'/>${chars}</svg>`;
};

/** GET /v1/captcha：每次换新 id 与新图，旧 id 随即过期 */
export const mockCaptcha = () => {
  captchaSeq += 1;
  const code = Array.from({ length: 4 }, (_, index) => CAPTCHA_CHARS[(captchaSeq * 3 + index * 7) % CAPTCHA_CHARS.length]).join(
    ""
  );
  const captchaId = `mock-captcha-${captchaSeq}`;

  // 只留最近 5 张，演示时池子不至于无限增长
  captchaPool.set(captchaId, code);
  if (captchaPool.size > 5) {
    const oldest = captchaPool.keys().next().value;
    if (oldest) captchaPool.delete(oldest);
  }

  return { captchaId, img: buildCaptchaSvg(code), expiresIn: 300, devCode: code };
};

/** 忘记密码固定通过码：mock 无邮件通道，用 123456 走通全流程 */
export const MOCK_FORGOT_CODE = "123456";

/** 邮箱验证码尝试计数：达到上限回 20010，其余错码回 20009 */
const forgotAttempts = new Map<string, number>();

/** POST /v1/auth/password/forgot：账号不存在、邮箱不符、冷却中一律回同一成功结构 */
export const mockForgotPassword = (config: AxiosRequestConfig) => {
  const body = parseBody<{ username?: string; email?: string; captchaId?: string; captchaCode?: string }>(config);
  const captchaId = body.captchaId ?? "";
  const stored = captchaPool.get(captchaId);

  // 图形码一次性：校验即销毁，重复提交按过期处理
  if (!stored) throw { mockCode: 10201 };
  captchaPool.delete(captchaId);
  if ((body.captchaCode ?? "").toUpperCase() !== stored) throw { mockCode: 10202 };

  forgotAttempts.delete(`${body.username ?? ""}|${body.email ?? ""}`);
  return { expiresMinutes: 10 };
};

/** POST /v1/auth/password/reset：固定码通过，错码累计 5 次后按尝试过多锁定 */
export const mockResetPassword = (config: AxiosRequestConfig) => {
  const body = parseBody<{ username?: string; email?: string; code?: string; newPassword?: string }>(config);
  const key = `${body.username ?? ""}|${body.email ?? ""}`;
  const password = body.newPassword ?? "";

  if (password.length < 8 || password.length > 32 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw { mockCode: 20005 };
  }

  if (body.code !== MOCK_FORGOT_CODE) {
    const count = (forgotAttempts.get(key) ?? 0) + 1;
    forgotAttempts.set(key, count);
    throw { mockCode: count >= 5 ? 20010 : 20009 };
  }

  forgotAttempts.delete(key);
  return { username: body.username ?? "" };
};
