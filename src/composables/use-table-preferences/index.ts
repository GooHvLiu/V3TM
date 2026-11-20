/**
 * 表格偏好 · 通用组合式
 * 职责：列显隐与行密度的读取与写入，按表标识落到本地存储
 * 约定：存储只负责记忆，读不到或结构不符时回落默认；不阻塞首屏，也不抛错
 */
import { ref } from "vue";
import { resolveColumnVisibility } from "@/components/common/table/pro-table/helpers";
import type { ColumnVisibility } from "@/components/common/table/pro-table/helpers";
import type { ProTableColumn } from "@/components/common/table/pro-table/types";

/** 行密度：与 ProTable 的 density 同名同值 */
export type TableDensity = "default" | "compact";

interface TablePreferences {
  density: TableDensity;
  columnVisibility: ColumnVisibility;
}

const STORAGE_PREFIX = "v3:table:";

/** 取存储对象：浏览器禁用本地存储时访问本身会抛，包一层返回 null */
const storage = (): Storage | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

/** 结构校验只看形状不看内容：未知字段丢弃，缺字段交给调用方补默认 */
const readStored = (key: string): Partial<TablePreferences> => {
  const store = storage();
  if (!store) return {};

  try {
    const raw = store.getItem(STORAGE_PREFIX + key);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    const record = parsed as Record<string, unknown>;
    const density: TableDensity | undefined =
      record.density === "compact" || record.density === "default" ? record.density : undefined;
    const stored = record.columnVisibility;
    const columnVisibility: ColumnVisibility | undefined =
      stored && typeof stored === "object" && !Array.isArray(stored) ? (stored as ColumnVisibility) : undefined;

    return { density, columnVisibility };
  } catch {
    return {};
  }
};

const writeStored = (key: string, value: TablePreferences): void => {
  const store = storage();
  if (!store) return;

  try {
    store.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // 隐私模式或配额已满：记忆失效，表格照常工作
  }
};

export function useTablePreferences(key: string, columns: () => ProTableColumn[]) {
  const stored = readStored(key);

  /** 列显隐按当前列定义归一化：存过但缺的列默认可见 */
  const columnVisibility = ref<ColumnVisibility>(resolveColumnVisibility(columns(), stored.columnVisibility));
  const density = ref<TableDensity>(stored.density ?? "default");

  const persist = (visibility?: ColumnVisibility): void => {
    // 一张表按分类换列定义时共用一份记忆：本次没出现的列沿用已存值，别把别的分类的项冲掉
    const latest = readStored(key).columnVisibility ?? {};
    writeStored(key, {
      density: density.value,
      columnVisibility: { ...latest, ...(visibility ?? columnVisibility.value) }
    });
  };

  const setColumnVisibility = (value: ColumnVisibility): void => {
    columnVisibility.value = resolveColumnVisibility(columns(), value);
    persist();
  };

  const setDensity = (value: TableDensity): void => {
    density.value = value === "compact" ? "compact" : "default";
    persist();
  };

  return { columnVisibility, density, setColumnVisibility, setDensity };
}
