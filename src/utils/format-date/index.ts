/**
 * ==========================================
 * 日期处理工具包 TS版
 * ------------------------------------------
 * 基于 dayjs 封装的通用日期/时间工具函数集合。
 * 所有函数均为纯函数，入参为空值或非法日期时安全兜底，不抛异常。
 *
 * 插件按需启用：默认只引入中文语言包。
 * 如需相对时间（3分钟前）、时区、UTC 等能力，取消下方注释即可。
 *
 * @example
 * // 格式化
 * formatDate("2026-10-10")              // "2026-10-10 00:00:00"
 * formatDate("2026-10-10", "YYYY/MM/DD")// "2026/10/10"
 * formatDate(undefined)                  // ""
 *
 * // 当前日期 / 年月
 * getCurrentDate()                       // "2026-10-10"
 * getCurrentYearMonth()                  // "2026年10月"
 *
 * // 比较
 * isSameMonth("2026-10-01", "2026-10-20") // true
 *
 * // 差值与加减
 * getDateDiff("2026-10-10", "2026-10-01") // 9
 * addDate("2026-10-10", 3)                 // "2026-10-13"
 * ==========================================
 */
import dayjs from "dayjs";
import type { ConfigType, ManipulateType, QUnitType, OpUnitType } from "dayjs";
import "dayjs/locale/zh-cn";

// 按需引入插件（如需要相对时间、时区等，取消注释即可）
// import relativeTime from "dayjs/plugin/relativeTime";
// import timezone from "dayjs/plugin/timezone";
// import utc from "dayjs/plugin/utc";
// dayjs.extend(relativeTime);
// dayjs.extend(timezone);
// dayjs.extend(utc);

// 设置 dayjs 默认语言为中文
dayjs.locale("zh-cn");

/**
 * 日期格式化工具函数
 *
 * 将时间戳、日期字符串、Date 对象或 dayjs 实例格式化为指定字符串。
 * 入参为空或解析失败时返回空字符串。
 *
 * @param date - 待格式化的日期，支持时间戳、日期字符串、Date 对象、dayjs 实例
 * @param template - 目标格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串；空值或无有效日期返回空字符串
 *
 * @example
 * formatDate("2026-10-10")              // "2026-10-10 00:00:00"
 * formatDate("2026-10-10", "YYYY/MM/DD")// "2026/10/10"
 * formatDate(undefined)                  // ""
 */
export const formatDate = (date?: string | number | Date, template = "YYYY-MM-DD HH:mm:ss"): string =>
  date ? dayjs(date).format(template) : "";

/**
 * 获取当前日期，按指定格式返回
 *
 * @param format - 目标格式，默认 'YYYY-MM-DD'
 * @returns 当前日期字符串
 *
 * @example
 * getCurrentDate()               // "2026-10-10"
 * getCurrentDate("YYYY年MM月DD日") // "2026年10月10日"
 */
export const getCurrentDate = (format = "YYYY-MM-DD"): string => {
  return dayjs().format(format);
};

/**
 * 获取当前年月，格式如 "2026年10月"
 *
 * @returns 当前年月字符串
 *
 * @example
 * getCurrentYearMonth() // "2026年10月"
 */
export const getCurrentYearMonth = (): string => {
  return dayjs().format("YYYY年MM月");
};

/**
 * 判断两个日期是否属于同一时间单位
 *
 * @param date1 - 日期1
 * @param date2 - 日期2
 * @param unit - 比较单位，默认 'month'
 * @returns 属于同一单位返回 true，否则返回 false
 *
 * @example
 * isSame("2026-10-10", "2026-10-20", "month") // true
 * isSame("2026-10-10", "2026-11-10", "month") // false
 */
export const isSame = (date1: ConfigType, date2: ConfigType, unit: QUnitType | OpUnitType = "month"): boolean => {
  return dayjs(date1).isSame(dayjs(date2), unit as ManipulateType);
};

/**
 * 判断两个日期是否属于同一个月
 *
 * @param date1 - 日期1
 * @param date2 - 日期2
 * @returns 同月返回 true，否则返回 false
 *
 * @example
 * isSameMonth("2026-10-01", "2026-10-20") // true
 * isSameMonth("2026-10-01", "2026-11-01") // false
 */
export const isSameMonth = (date1: ConfigType, date2: ConfigType): boolean => {
  return isSame(date1, date2, "month");
};

/**
 * 计算两个日期之间的差值
 *
 * @param date1 - 日期1（被减数）
 * @param date2 - 日期2（减数）
 * @param unit - 差值单位，默认 'day'
 * @returns 差值（date1 - date2），单位为指定单位
 *
 * @example
 * getDateDiff("2026-10-10", "2026-10-01")      // 9
 * getDateDiff("2026-10-10", "2026-10-01", "hour") // 216
 */
export const getDateDiff = (date1: ConfigType, date2: ConfigType, unit: QUnitType | OpUnitType = "day"): number => {
  return dayjs(date1).diff(dayjs(date2), unit as ManipulateType);
};

/**
 * 日期加减
 *
 * @param date - 原始日期
 * @param amount - 加减数量，正数加，负数减
 * @param unit - 单位，默认 'day'
 * @param format - 返回格式，默认 'YYYY-MM-DD'
 * @returns 计算后的日期字符串
 *
 * @example
 * addDate("2026-10-10", 3)         // "2026-10-13"
 * addDate("2026-10-10", -1, "day") // "2026-10-09"
 * addDate("2026-10-10", 1, "month")// "2026-11-10"
 */
export const addDate = (date: ConfigType, amount: number, unit: OpUnitType = "day", format = "YYYY-MM-DD"): string => {
  return dayjs(date)
    .add(amount, unit as ManipulateType)
    .format(format);
};

/**
 * 解析日期为 dayjs 实例，无效时返回 null
 *
 * @param date - 待解析的日期
 * @returns dayjs 实例或 null
 *
 * @example
 * parseDate("2026-10-10") // Dayjs 对象
 * parseDate("invalid")     // null
 * parseDate(undefined)     // null
 */
export const parseDate = (date?: ConfigType | null): dayjs.Dayjs | null => {
  if (date === null || date === undefined || date === "") {
    return null;
  }
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : null;
};
