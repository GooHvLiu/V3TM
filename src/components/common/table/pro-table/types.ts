/**
 * 通用表格 · 列配置类型
 * 独立文件：泛型组件内不可 export 类型，故类型与组件分离
 */
export type ProTableColumnAlign = "left" | "center" | "right";
export type ProTableColumnFixed = "left" | "right";
export type ProTableSortOrder = "ascending" | "descending";

export interface ProTableSort {
  prop: string;
  order: ProTableSortOrder;
}

/** 排序变化：order 为 null 表示取消该列排序 */
export interface ProTableSortChange {
  prop: string;
  order: ProTableSortOrder | null;
}

export interface ProTableColumn<T = unknown> {
  prop: string;
  label: string;
  width?: number;
  minWidth?: number;
  align?: ProTableColumnAlign;
  fixed?: ProTableColumnFixed;
  sortable?: boolean;
  showOverflowTooltip?: boolean;
  /** 初次渲染是否显示；用户勾选后以列设置为准 */
  visible?: boolean;
  /** 是否允许在列设置里隐藏；关键列可设为 false */
  hideable?: boolean;
  /** 无自定义单元格插槽时的文本格式化 */
  formatter?: (row: T, value: unknown, index: number) => string;
}
