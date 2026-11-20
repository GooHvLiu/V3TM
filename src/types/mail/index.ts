/**
 * ==========================================
 * Mail | 邮件服务状态与测试
 * ==========================================
 */

/** 测试模式：full=发送并回读；send=只发送；verify=只验证 SMTP 登录 */
export type MailTestMode = "full" | "send" | "verify";

/** 邮件发送日志（最近一次测试由状态接口带出） */
export interface MailTestLog {
  id: number;
  userId: number | null;
  toEmail: string;
  subject: string;
  template: string;
  status: string;
  testId: string | null;
  messageId: string | null;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
  receivedAt: string | null;
}

/** 服务状态：授权码只给“是否已设置”，不给明文 */
export interface MailStatusResult {
  enabled: boolean;
  configured: boolean;
  passSet: boolean;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    from: string;
    fromName: string;
    timeoutMs: number;
  };
  imap: {
    host: string;
    port: number;
    secure: boolean;
    readback: boolean;
    timeoutMs: number;
  };
  lastTest: MailTestLog | null;
}

/** 测试结果：full 模式三项同时成立才算可用；回读落在垃圾箱记 blocked */
export interface MailTestResult {
  mode: MailTestMode;
  status: "received" | "blocked" | "sent" | "verified" | "failed";
  testId: string | null;
  to: string;
  subject: string;
  messageId: string | null;
  smtpAccepted: boolean;
  received: boolean | null;
  /** 回读落点：INBOX / JUNK 等；未回读时为 null */
  receivedFolder: string | null;
  readbackEnabled: boolean;
  readbackError: string | null;
  error: string | null;
  elapsedMs: number;
  sentAt: string | null;
}
