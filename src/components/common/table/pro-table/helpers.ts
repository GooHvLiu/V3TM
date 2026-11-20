/**
 * 通用表格 · 列状态与单元格取值
 * 与组件分离，保证列显隐、排序归一和格式化可以被单测覆盖
 */
import type { ProTableColumn, ProTableSortOrder } from "./types";

export type ColumnVisibility = Record<string, boolean>;

/** 以列配置为基准生成显隐表；关键列始终可见，已有勾选优先 */
export const resolveColumnVisibility = (
  columns: ProTableColumn[],
  previous: ColumnVisibility = {}
): ColumnVisibility =>
  columns.reduce<ColumnVisibility>((next, column) => {
    next[column.prop] = column.hideable === false ? true : (previous[column.prop] ?? column.visible !== false);
    return next;
  }, {});

/** 按显隐表裁剪列，未记录的列视为可见 */
export const filterVisibleColumns = (
  columns: ProTableColumn[],
  visibility: ColumnVisibility
): ProTableColumn[] => columns.filter((column) => visibility[column.prop] !== false);

/** 能否在列设置里隐藏：关键列不参与，只剩最后一列时也不允许再隐藏 */
export const isColumnToggleLocked = (
  columns: ProTableColumn[],
  visibility: ColumnVisibility,
  prop: string
): boolean => {
  const column = columns.find((item) => item.prop === prop);
  if (!column || column.hideable === false) return true;
  const visible = filterVisibleColumns(columns, visibility);
  return visible.length === 1 && visible[0]?.prop === prop;
};

/** 列设置面板的条目：勾选态与禁用态都由列配置和显隐表推导 */
export interface ColumnSettingItem {
  prop: string;
  label: string;
  checked: boolean;
  disabled: boolean;
}

export const buildColumnSettings = (
  columns: ProTableColumn[],
  visibility: ColumnVisibility
): ColumnSettingItem[] =>
  columns.map((column) => ({
    prop: column.prop,
    label: column.label || column.prop,
    checked: visibility[column.prop] !== false,
    disabled: isColumnToggleLocked(columns, visibility, column.prop)
  }));

/** el-table 的排序值归一，其它值一律视为取消排序 */
export const toSortOrder = (order: string | null | undefined): ProTableSortOrder | null =>
  order === "ascending" || order === "descending" ? order : null;

/** 无单元格插槽时的文本：formatter 优先，其次字段值，空值返回空串 */
export const formatColumnCell = <T>(row: T, column: ProTableColumn, index: number): string => {
  const value = (row as Record<string, unknown>)[column.prop];
  if (column.formatter) return column.formatter(row, value, index);
  return value == null ? "" : String(value);
};
