/**
 * ==========================================
 * Mail | 邮件服务接口
 * ==========================================
 */
import { http } from "@/utils/request";
import type { AxiosRequestConfig } from "axios";
import type { RequestExtraConfig } from "@/utils/request";
import type { MailStatusResult, MailTestResult, MailTestMode } from "@/types";

enum API {
  MAIL_STATUS = "/v1/super-admin/settings/mail/status",
  MAIL_TEST = "/v1/super-admin/settings/mail/test"
}

/** 回读阶段最长等 30 秒，整体上限放到 65 秒，避免被全局默认超时截断 */
const MAIL_TEST_TIMEOUT = 65_000;

type MailRequestConfig = AxiosRequestConfig & RequestExtraConfig;

/** 邮件服务状态：授权码只返回是否已设置 */
export function getMailStatus(config?: MailRequestConfig): Promise<MailStatusResult> {
  return http.get<MailStatusResult>(API.MAIL_STATUS, config);
}

/** 测试邮件服务：默认 full，单请求超时单独放宽 */
export function testMail(mode: MailTestMode = "full", config?: MailRequestConfig): Promise<MailTestResult> {
  return http.post<MailTestResult>(API.MAIL_TEST, { mode }, { timeout: MAIL_TEST_TIMEOUT, ...config });
}
