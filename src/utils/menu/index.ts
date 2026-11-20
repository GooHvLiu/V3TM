/**
 * ==========================================
 * 菜单工具函数
 * ------------------------------------------
 * 纯函数：不依赖 store/组件，输入菜单数组 → 输出分组结构
 * ==========================================
 */
import type { Menu, MenuItems, NavGroup, FlatMenu, TranslateFn } from "@/types";

/**
 * 按内部字段过滤菜单（后端契约：status/visible 均为 0|1，0 = 隐藏）
 * - type=BUTTON / visible=0 / status=0 → 剔除（含子树递归）
 * 在数据写入 store 时统一过滤 → 渲染、搜索、动态路由共用同一份"启用菜单"
 */
export const filterMenuEnabled = (items: Menu[]): Menu[] =>
  items
    .filter((m) => m.type !== "BUTTON" && m.visible === 1 && m.status === 1)
    .map((m) =>
      m.children?.length ? { ...m, children: filterMenuEnabled(m.children) } : { ...m, children: undefined }
    );

/** 兜底组 i18n key：无 menu_group 的顶层菜单归入此组，显示走 menu.group.misc */
const FALLBACK_GROUP = "menu.group.misc";

/** 取组号（sort 十位） */
const getGroupNumber = (sort: number): number => Math.floor(sort / 10);

/**
 * 递归排序：菜单及其 children 都按 sort 升序
 * 返回新数组（不修改原数据，纯函数）
 */
const sortMenuTree = (menus: Menu[]): Menu[] =>
  menus
    .map((menu) => ({
      ...menu,
      children: menu.children?.length ? sortMenuTree(menu.children) : undefined
    }))
    .sort((a, b) => a.sort - b.sort);

/**
 * 校验：同组菜单的 sort 十位必须一致（后端数据契约）
 * 不一致 → console.error 打印明细（不 throw，不让整站挂掉）
 */
const validateGroup = (group: string, items: Menu[]): void => {
  const groupNumber = getGroupNumber(items[0].sort);
  const invalid = items.find((item) => getGroupNumber(item.sort) !== groupNumber);
  if (invalid) {
    console.error(
      `开发期契约告警-菜单分组校验失败：组 [${group}] 中 [${invalid.name}(sort=${invalid.sort})] 的组号与期望 ${groupNumber} 不一致`
    );
  }
};

/**
 * 菜单分组聚合（入口）
 * ------------------------------------------
 * 入参: MenuItems（后端返回的菜单数组）
 * 出参: NavGroup[]（有组按 menu_group 聚合 + 组内排序；无组归兜底组置底）
 */
export const groupMenuData = (menus: MenuItems): NavGroup[] => {
  // ① 遍历分组：有 menu_group（非空串）归组，空串/null 归兜底
  const groupMap = new Map<string, Menu[]>();
  const fallback: Menu[] = [];

  for (const menu of menus) {
    if (menu.menu_group) {
      const list = groupMap.get(menu.menu_group) ?? [];
      list.push(menu);
      groupMap.set(menu.menu_group, list);
    } else {
      fallback.push(menu);
    }
  }

  // ② 组装分组：每组校验 + 递归排序（children 也排）
  const groups: NavGroup[] = [];
  for (const [title, items] of groupMap) {
    validateGroup(title, items);
    groups.push({ title, items: sortMenuTree(items) });
  }

  // ③ 组间排序：按各组最小 sort 十位升序（General=1 → Tasks=2 → Settings=3）
  groups.sort((a, b) => getGroupNumber(a.items[0].sort) - getGroupNumber(b.items[0].sort));

  // ④ 兜底组置底
  if (fallback.length) {
    groups.push({ title: FALLBACK_GROUP, items: sortMenuTree(fallback) });
  }

  return groups;
};

/** 取父路径：去掉最后一段（/a/b/c → /a/b；/a → ""） */
export const getParentPath = (path: string): string => {
  const idx = path.lastIndexOf("/");
  return idx > 0 ? path.slice(0, idx) : "";
};

/**
 * 手风琴展开逻辑（纯函数，返回新数组）
 * 入参: 当前展开链 + 点击的 path
 * 出参: 新的展开链
 */
export const toggleOpenPath = (openPaths: string[], path: string): string[] => {
  const idx = openPaths.indexOf(path);
  if (idx !== -1) {
    // 已展开：收起自己及以下
    return openPaths.slice(0, idx);
  }
  // 未展开：移除同层兄弟（同父），追加自己
  return [...openPaths.filter((p) => getParentPath(p) !== getParentPath(path)), path];
};

/**
 * 递归查找 path 所属的 DIR 链（顶层 → 最近的父 DIR）
 * 例: /userRoles/roles/xxx → ["/userRoles", "/userRoles/roles"]
 * 找不到返回 []
 */
export const findParentDirChain = (menus: Menu[], path: string): string[] => {
  for (const menu of menus) {
    if (menu.type === "DIR") {
      // 叶子直接挂在当前 DIR 下
      if (menu.children?.some((child) => child.path === path)) {
        return [menu.path];
      }
      // 递归：在子 DIR 里继续找
      const subChain = findParentDirChain(menu.children ?? [], path);
      if (subChain.length) {
        return [menu.path, ...subChain];
      }
    }
  }
  return [];
};

/**
 * 递归拍平菜单
 * 入参: Menu[]（原始菜单数组，含 DIR/MENU/BUTTON 与 children）
 * 出参: FlatMenu[]（可跳转项；BUTTON 与 visible=0 跳过，DIR 与 MENU 均收入）
 */
export const flattenMenuItems = (items: Menu[]): FlatMenu[] => {
  const result: FlatMenu[] = [];
  const walk = (list: Menu[]): void => {
    list.forEach((item) => {
      if (item.type === "BUTTON" || item.visible === 0) return;
      result.push({ nameKey: item.name, path: item.path, icon: item.icon ?? "" });
      if (item.children?.length) walk(item.children);
    });
  };
  walk(items);
  return result;
};

/**
 * 按关键字过滤（翻译后文本匹配，忽略大小写）
 * 入参: FlatMenu[] + 关键字 + 翻译函数
 * 出参: FlatMenu[]（空关键字 = 原列表原样返回）
 */
export const filterMenuItems = (items: FlatMenu[], keyword: string, t: TranslateFn): FlatMenu[] => {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return items;
  return items.filter((item) => t(item.nameKey).toLowerCase().includes(kw));
};

/** 按菜单 id 集合过滤菜单树（保留层级；供 profile 按角色 menuIds 裁剪可见菜单） */
export const filterMenusByIds = (menus: MenuItems, ids: number[]): MenuItems =>
  menus
    .filter((menu) => ids.includes(menu.id))
    .map((menu) => ({
      ...menu,
      children: menu.children?.length ? filterMenusByIds(menu.children, ids) : []
    }));
