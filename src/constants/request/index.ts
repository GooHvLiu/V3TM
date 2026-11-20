/**
 * 接口业务码常量
 * ------------------------------------------
 * 成功 HTTP 200 + code 200；失败由 HTTP 状态码表达传输层语义，
 * 页面只按业务码做分支，不解析 msg 文本。
 */
export const SUCCESS_CODE = 200;

/** 凭证过期：可续期，单飞 refresh 后重放原请求 */
export const UNAUTHORIZED_CODES = [10102];

/** 凭证缺失 / 令牌无效 / 会话已吊销：续期无法自愈，清本地重登 */
export const RELOGIN_CODES = [10101, 10103];

/** 未完成强制改密：识别后回改密页，不当普通表单错误、不重试 */
export const PASSWORD_CHANGE_REQUIRED = 20015;

/** 登录密码错误：401 但不触发续期 */
export const USER_PASSWORD_ERROR = 20003;

/** 页面分支会用到的业务码，避免散落魔法数字 */
export const BUSINESS_CODE = {
  PARAM_INVALID: 10003,
  DATA_CONFLICT: 10503,
  USER_PASSWORD_ERROR,
  PASSWORD_WEAK: 20005,
  PASSWORD_RESET_CODE_INVALID: 20009,
  PASSWORD_RESET_TOO_MANY_ATTEMPTS: 20010,
  PASSWORD_RESET_ACCOUNT_NOT_FOUND: 20012,
  PASSWORD_SAME_AS_OLD: 20014,
  PASSWORD_CHANGE_REQUIRED,
  PASSWORD_RESET_TOO_FREQUENT: 20018,
  DICT_VALUE_EXIST: 30020,
  TASK_EXEC_FAILED: 60006
} as const;
