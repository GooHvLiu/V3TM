/**
 * ==========================================
 * Mail | 邮件服务 mock
 * ------------------------------------------
 * 状态与测试读 configs 注册表，改配置后状态立即跟着变；
 * 测试只演示成功路径，失败分支由真实后端返回。
 * ==========================================
 */
import type { AxiosRequestConfig } from "axios";
import type { MailStatusResult, MailTestLog, MailTestResult, MailTestMode } from "@/types";
import { parseBody, mockError } from "../utils";
import { getMockConfigValue } from "../configs";

const num = (key: string): number => Number(getMockConfigValue(key)) || 0;
const bool = (key: string): boolean => getMockConfigValue(key) === "true";

/** 演示账号：与 mock 用户表的超管保持一致，接真库后失效 */
const DEMO_USER_ID = 2;

let lastTest: MailTestLog | null = null;
let lastTestId = 0;

const isConfigured = (): boolean =>
  Boolean(
    getMockConfigValue("mail_smtp_host") &&
      num("mail_smtp_port") &&
      getMockConfigValue("mail_smtp_user") &&
      getMockConfigValue("mail_smtp_pass")
  );

/** GET /v1/super-admin/settings/mail/status */
export const mockMailStatus = (): MailStatusResult => ({
  enabled: bool("mail_enabled"),
  configured: isConfigured(),
  passSet: Boolean(getMockConfigValue("mail_smtp_pass")),
  smtp: {
    host: getMockConfigValue("mail_smtp_host"),
    port: num("mail_smtp_port"),
    secure: bool("mail_smtp_secure"),
    user: getMockConfigValue("mail_smtp_user"),
    from: getMockConfigValue("mail_from") || getMockConfigValue("mail_smtp_user"),
    fromName: getMockConfigValue("mail_from_name"),
    timeoutMs: num("mail_timeout_ms")
  },
  imap: {
    host: getMockConfigValue("mail_imap_host"),
    port: num("mail_imap_port"),
    secure: bool("mail_imap_secure"),
    readback: bool("mail_test_readback"),
    timeoutMs: num("mail_test_readback_timeout_ms")
  },
  lastTest
});

/** POST /v1/super-admin/settings/mail/test */
export const mockMailTest = async (config: AxiosRequestConfig): Promise<MailTestResult> => {
  const { mode = "full" } = parseBody<{ mode?: MailTestMode }>(config);
  if (!isConfigured()) throw mockError(90001, "MAIL_NOT_CONFIGURED");

  // 让加载态与阶段文案有真实表现
  await new Promise((resolve) => setTimeout(resolve, 1_200));

  const now = new Date();
  const testId = `mock-${now.getTime()}`;
  const readback = bool("mail_test_readback");
  /** 回读落点：改成 JUNK 可复现垃圾箱分支 */
  const READBACK_FOLDER: "INBOX" | "JUNK" = "INBOX";
  const receivedFolder: string | null = readback ? READBACK_FOLDER : null;
  const base = {
    mode,
    testId,
    to: getMockConfigValue("mail_smtp_user"),
    subject: `V3TM 邮件服务测试 ${testId}`,
    messageId: `<${testId}@v3tm.local>`,
    smtpAccepted: true,
    receivedFolder,
    readbackEnabled: readback,
    readbackError: null,
    error: null,
    elapsedMs: 1_200,
    sentAt: now.toISOString()
  };

  const result: MailTestResult =
    mode === "verify"
      ? { ...base, status: "verified", received: null }
      : mode === "send"
        ? { ...base, status: "sent", received: null }
        : {
            ...base,
            status: readback ? (receivedFolder === "JUNK" ? "blocked" : "received") : "sent",
            received: readback ? true : null
          };

  lastTestId += 1;
  lastTest = {
    id: lastTestId,
    userId: DEMO_USER_ID,
    toEmail: result.to,
    subject: result.subject,
    template: "test",
    status: result.status,
    testId: result.testId,
    messageId: result.messageId,
    error: result.error,
    createdAt: now.toISOString(),
    sentAt: result.sentAt,
    receivedAt: result.received ? now.toISOString() : null
  };

  return result;
};
