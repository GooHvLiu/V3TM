/**
 * ==========================================
 * 本地持久化存储工具 TS版
 * ------------------------------------------
 * 统一封装 localStorage / sessionStorage：
 * - 自动加前缀避免多项目共存时 key 冲突
 * - 类型安全，泛型存取
 * - 支持过期时间（TTL）
 * - JSON 解析失败自动兜底，不抛异常
 * - 提供 has / keys / clear 等常用方法
 *
 * @example
 * // 写入（7 天过期）
 * storage.set("token", "abc123", { expire: 7 * 24 * 60 * 60 * 1000 });
 *
 * // 读取
 * const token = storage.get<string>("token");
 *
 * // 判断是否存在
 * storage.has("token");
 *
 * // 删除
 * storage.remove("token");
 *
 * // 存对象
 * storage.set("userInfo", { name: "张三", age: 30 });
 * const user = storage.get<{ name: string; age: number }>("userInfo");
 *
 * // 用 sessionStorage
 * storage.set("draft", "草稿", {}, "session");
 * ==========================================
 */

// 引入本地存储数据类型定义
import type { StorageType, StorageOptions, StoragePayload } from "@/types";

/** key 前缀，多项目部署时改成各自项目名 */
const PREFIX = "V3T_";

/** 无浏览器环境（文档站 SSR、构建期渲染）下的内存存储，接口与 Storage 对齐 */
const createMemoryStorage = (): Storage => {
  const bucket = new Map<string, string>();
  return {
    get length(): number {
      return bucket.size;
    },
    clear(): void {
      bucket.clear();
    },
    getItem(key: string): string | null {
      return bucket.get(key) ?? null;
    },
    key(index: number): string | null {
      return Array.from(bucket.keys())[index] ?? null;
    },
    removeItem(key: string): void {
      bucket.delete(key);
    },
    setItem(key: string, value: string): void {
      bucket.set(key, String(value));
    }
  };
};

const memoryStorage: Record<StorageType, Storage> = {
  local: createMemoryStorage(),
  session: createMemoryStorage()
};

/** 根据驱动类型取 Storage 实例；SSR 阶段退回内存实现，避免访问 window */
const getStorage = (type: StorageType): Storage => {
  if (typeof window === "undefined") return memoryStorage[type];
  return type === "local" ? window.localStorage : window.sessionStorage;
};

/** 拼接完整 key */
const buildKey = (key: string) => `${PREFIX}${key}`;

export const storage = {
  /**
   * 写入数据
   * @param key 存储键
   * @param value 存储值
   * @param options 存储选项
   * @param options.expire 过期毫秒数，不传永久有效
   * @param type 存储驱动，默认 localStorage
   *
   * @example
   * storage.set("token", "abc", { expire: 7 * 24 * 60 * 60 * 1000 });
   */
  set<T>(key: string, value: T, options: StorageOptions = {}, type: StorageType = "local"): void {
    const { expire } = options;
    const payload: StoragePayload<T> = {
      timestamp: Date.now(),
      expireAt: expire ? Date.now() + expire : 0,
      value
    };
    try {
      getStorage(type).setItem(buildKey(key), JSON.stringify(payload));
    } catch (error) {
      console.warn(`[storage.set] 写入失败 key=${key}`, error);
    }
  },

  /**
   * 读取数据，过期或不存在返回 null
   * @param key 存储键
   * @param type 存储驱动，默认 localStorage
   *
   * @example
   * const token = storage.get<string>("token");
   */
  get<T = unknown>(key: string, type: StorageType = "local"): T | null {
    const raw = getStorage(type).getItem(buildKey(key));
    if (!raw) return null;
    try {
      const payload = JSON.parse(raw) as StoragePayload<T>;
      // 过期判断：expireAt 为 0 表示永久
      if (payload.expireAt && Date.now() > payload.expireAt) {
        this.remove(key, type);
        return null;
      }
      return payload.value;
    } catch (error) {
      console.warn(`[storage.get] 解析失败 key=${key}`, error);
      return null;
    }
  },

  /**
   * 删除指定 key
   */
  remove(key: string, type: StorageType = "local"): void {
    getStorage(type).removeItem(buildKey(key));
  },

  /**
   * 判断 key 是否存在（过期不算存在）
   */
  has(key: string, type: StorageType = "local"): boolean {
    return this.get(key, type) !== null;
  },

  /**
   * 获取当前前缀下所有 key（不含前缀）
   */
  keys(type: StorageType = "local"): string[] {
    const result: string[] = [];
    const storage = getStorage(type);
    for (let i = 0; i < storage.length; i++) {
      const fullKey = storage.key(i);
      if (fullKey?.startsWith(PREFIX)) {
        result.push(fullKey.slice(PREFIX.length));
      }
    }
    return result;
  },

  /**
   * 清空当前前缀下的所有 key（不动其他项目的数据）
   */
  clear(type: StorageType = "local"): void {
    this.keys(type).forEach((key) => this.remove(key, type));
  }
};
