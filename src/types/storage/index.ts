/**
 * ==========================================
 * util / storage.ts 数据类型定义
 * ==========================================
 */
/** 存储驱动类型 */
export type StorageType = "local" | "session";

/** 写入时的可选配置项 */
export interface StorageOptions {
  /** 过期时间，单位毫秒；不传则永久有效 */
  expire?: number;
}

/** 存储项的数据结构（写入时包一层，便于做过期判断） */
export interface StoragePayload<T> {
  /** 写入时间戳 */
  timestamp: number;
  /** 过期时间戳，0 表示永不过期 */
  expireAt: number;
  /** 实际业务数据 */
  value: T;
}
