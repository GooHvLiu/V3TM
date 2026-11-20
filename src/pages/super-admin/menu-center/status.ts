/**
 * ==========================================
 * 菜单中心：类型标签 / 分组选项 / 树工具
 * ------------------------------------------
 * 纯函数与常量集中在此，页面与抽屉共用，避免两处各写一套判断
 * ==========================================
 */
import i18n from "@/locales";
import type { MenuTreeNode, MenuType } from "@/types";

interface MenuTypeMeta {
  labelKey: string;
  tag: "info" | "primary" | "warning";
}

export const MENU_TYPE_META: Record<MenuType, MenuTypeMeta> = {
  DIR: { labelKey: "menuCenter.type.DIR", tag: "info" },
  MENU: { labelKey: "menuCenter.type.MENU", tag: "primary" },
  BUTTON: { labelKey: "menuCenter.type.BUTTON", tag: "warning" }
};

export const MENU_TYPE_OPTIONS = (Object.keys(MENU_TYPE_META) as MenuType[]).map((value) => ({
  value,
  labelKey: MENU_TYPE_META[value].labelKey
}));

/** 分组只对顶层 DIR/MENU 开放，取值沿用 menu.group.*，后端不校验 */
export const MENU_GROUP_OPTIONS = [
  "menu.group.General",
  "menu.group.Tasks",
  "menu.group.Settings",
  "menu.group.superAdmin",
  "menu.group.misc"
].map((value) => ({ value, labelKey: value }));

/** name 是 i18n key 时取译文，取不到回退原串 */
export const menuNameOf = (name: string | null): string => {
  if (!name) return "";
  return i18n.global.te(name) ? i18n.global.t(name) : name;
};

export const isExternalPath = (path: string): boolean => /^https?:\/\//i.test(path);

/** 站内路径：/ 开头、无尾斜杠、无 //、无空白 */
export const isValidInternalPath = (path: string): boolean =>
  path.startsWith("/") && path.length > 1 && !path.endsWith("/") && !path.includes("//") && !/\s/.test(path);

export const isValidExternalPath = (path: string): boolean => /^https?:\/\/\S+$/i.test(path);

export const walkMenu = (
  nodes: MenuTreeNode[],
  visit: (node: MenuTreeNode, parent: MenuTreeNode | null) => void,
  parent: MenuTreeNode | null = null
): void => {
  nodes.forEach((node) => {
    visit(node, parent);
    if (node.children?.length) walkMenu(node.children, visit, node);
  });
};

export const findMenuNode = (nodes: MenuTreeNode[], id: number): MenuTreeNode | null => {
  let hit: MenuTreeNode | null = null;
  walkMenu(nodes, (node) => {
    if (node.id === id) hit = node;
  });
  return hit;
};

/** 展开全部用：所有带子节点的 id */
export const collectParentIds = (nodes: MenuTreeNode[]): number[] => {
  const ids: number[] = [];
  walkMenu(nodes, (node) => {
    if (node.children?.length) ids.push(node.id);
  });
  return ids;
};

/** 本地筛选：命中节点连同其祖先一起保留，树结构不塌 */
export const filterMenuTree = (nodes: MenuTreeNode[], matched: (node: MenuTreeNode) => boolean): MenuTreeNode[] =>
  nodes.reduce<MenuTreeNode[]>((result, node) => {
    const children = node.children?.length ? filterMenuTree(node.children, matched) : [];
    if (matched(node) || children.length) result.push({ ...node, children });
    return result;
  }, []);

/** 父级已删：parentId 非 0 且不在当前树里 */
export const isParentMissing = (nodes: MenuTreeNode[], parentId: number): boolean =>
  parentId !== 0 && findMenuNode(nodes, parentId) === null;
