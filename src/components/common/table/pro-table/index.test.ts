import { describe, expect, it } from "vitest";
import {
  buildColumnSettings,
  filterVisibleColumns,
  formatColumnCell,
  isColumnToggleLocked,
  resolveColumnVisibility,
  toSortOrder
} from "./helpers";
import type { ProTableColumn } from "./types";

interface Row {
  id: number;
  name: string;
  status?: number;
}

const columns: ProTableColumn[] = [
  { prop: "id", label: "ID", hideable: false },
  { prop: "name", label: "名称", visible: false },
  { prop: "status", label: "状态" }
];

describe("proTable helpers", () => {
  it("列显隐按 visible 初始化，关键列始终可见", () => {
    expect(resolveColumnVisibility(columns)).toEqual({ id: true, name: false, status: true });
  });

  it("已有勾选优先于默认值，新增列自动补齐", () => {
    const previous = { id: true, name: true, status: false };
    const nextColumns = [...columns, { prop: "createdAt", label: "创建时间" }];

    expect(resolveColumnVisibility(nextColumns, previous)).toEqual({
      id: true,
      name: true,
      status: false,
      createdAt: true
    });
  });

  it("按显隐表裁剪列", () => {
    expect(filterVisibleColumns(columns, { id: true, name: false, status: true }).map((column) => column.prop)).toEqual([
      "id",
      "status"
    ]);
  });

  it("排序值只接受升降序，其余归一为取消", () => {
    expect(toSortOrder("ascending")).toBe("ascending");
    expect(toSortOrder("descending")).toBe("descending");
    expect(toSortOrder(null)).toBeNull();
    expect(toSortOrder("custom")).toBeNull();
  });

  it("关键列与最后一列不参与隐藏，其余可切换", () => {
    const visibility = { id: true, name: false, status: true };

    expect(isColumnToggleLocked(columns, visibility, "id")).toBe(true);
    expect(isColumnToggleLocked(columns, visibility, "status")).toBe(false);
    expect(isColumnToggleLocked(columns, { id: true, name: false, status: false }, "id")).toBe(true);
    expect(isColumnToggleLocked(columns, { id: false, name: false, status: true }, "status")).toBe(true);
    expect(isColumnToggleLocked(columns, {}, "unknown")).toBe(true);
  });

  it("面板条目由列配置推导，勾选态与禁用态不再各算一遍", () => {
    const visibility = { id: true, name: false, status: true };

    expect(buildColumnSettings(columns, visibility)).toEqual([
      { prop: "id", label: "ID", checked: true, disabled: true },
      { prop: "name", label: "名称", checked: false, disabled: false },
      { prop: "status", label: "状态", checked: true, disabled: false }
    ]);
  });

  it("单元格优先走 formatter，空值显示空串", () => {
    const formatter = (row: unknown, _value: unknown, index: number): string =>
      `${index}-${(row as Row).name}`;
    const row: Row = { id: 1, name: "张坚" };

    expect(formatColumnCell(row, { prop: "name", label: "名称", formatter }, 2)).toBe("2-张坚");
    expect(formatColumnCell(row, { prop: "status", label: "状态" }, 0)).toBe("");
    expect(formatColumnCell(row, { prop: "id", label: "ID" }, 0)).toBe("1");
  });
});
