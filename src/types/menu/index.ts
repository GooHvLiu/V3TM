/**
 * ==========================================
 * 菜单类型
 * ------------------------------------------
 * Menu       侧边栏 / 动态路由消费（字段全为字符串）
 * MenuDto    管理端详情（历史数据可空）
 * DeletedMenuDto 回收站条目（MenuDto + 删除信息）
 * MenuFormPayload 写入体（PUT 合并语义下也按全量发送）
 * ==========================================
 */

export type MenuType = "DIR" | "MENU" | "BUTTON";

/** 菜单树节点（/list 全量、/tree 可见） */
export interface Menu {
  id: number;
  parentId: number;
  name: string;
  type: MenuType;
  menu_group: string | null;
  path: string;
  component: string;
  icon: string;
  permission: string;
  sort: number;
  status: 0 | 1;
  visible: 0 | 1;
  children?: Menu[];
}

export type MenuItems = Menu[];

/** 树节点别名：与 Menu 同构，读代码时区分“树”与“侧边栏”语义 */
export type MenuTreeNode = Menu;

export interface NavGroup {
  title: string;
  items: Menu[];
}

export interface FlatMenu {
  nameKey: string;
  path: string;
  icon: string;
}

/** 写入体：字段全部必填，前端提交全量，规避合并语义下旧值残留 */
export interface MenuFormPayload {
  parentId: number;
  name: string;
  type: MenuType;
  path: string;
  component: string;
  permission: string;
  icon: string;
  menu_group: string;
  sort: number;
  status: 0 | 1;
  visible: 0 | 1;
}

/** 管理端详情：可空字段来自历史数据，渲染前统一兜底 */
export interface MenuDto {
  id: number;
  parentId: number;
  name: string;
  type: MenuType;
  path: string | null;
  component: string | null;
  icon: string | null;
  menu_group: string | null;
  permission: string | null;
  sort: number;
  status: 0 | 1;
  visible: 0 | 1;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedMenuDto extends MenuDto {
  deletedAt: string;
  parentName: string | null;
}

/** 可编辑字段：抽屉既能吃 /list 节点，也能吃回收站条目 */
export type MenuEditableFields = Omit<MenuDto, "createdAt" | "updatedAt">;
