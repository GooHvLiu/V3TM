import type { AxiosRequestConfig } from "axios";
import { http } from "@/utils/request";
import type { RequestExtraConfig } from "@/utils/request";
import type { DeletedMenuDto, MenuFormPayload, MenuItems } from "@/types";

enum API {
  TREE = "/v1/menu/tree",
  LIST = "/v1/menu/list",
  DELETED = "/v1/menu/deleted",
  ROOT = "/v1/menu"
}

/**
 * 写操作静默：业务错误由表单自己映射到字段，
 * 避免拦截器先弹一条再在抽屉里提示一次
 */
const SILENT = { _silent: true } as AxiosRequestConfig & RequestExtraConfig;

/** 当前用户可见菜单树（不含 BUTTON / 禁用 / 隐藏），侧边栏与动态路由用 */
export function fetchMenuTree(): Promise<MenuItems> {
  return http.get<MenuItems>(API.TREE);
}

/** 管理端全量菜单树（含 BUTTON / 禁用 / 隐藏），配置页唯一数据源 */
export function fetchMenuList(): Promise<MenuItems> {
  return http.get<MenuItems>(API.LIST);
}

/** 回收站扁平列表，按删除时间倒序 */
export function fetchDeletedMenus(): Promise<DeletedMenuDto[]> {
  return http.get<DeletedMenuDto[]>(API.DELETED);
}

/** 新增菜单 / 按钮 */
export function createMenu(payload: MenuFormPayload): Promise<{ id: number } | null> {
  return http.post<{ id: number } | null>(API.ROOT, payload, SILENT);
}

/** 更新菜单：显式声明合并语义，调用方按需只传部分字段（如排序） */
export function updateMenu(id: number, payload: Partial<MenuFormPayload>): Promise<null> {
  return http.put<null>(`${API.ROOT}/${id}`, payload, SILENT);
}

/** 软删：有子菜单时后端返回 40002 */
export function deleteMenu(id: number): Promise<null> {
  return http.delete<null>(`${API.ROOT}/${id}`, SILENT);
}

/** 恢复单条：父级未恢复返回 40010，path 被占返回 40009 */
export function restoreMenu(id: number): Promise<null> {
  return http.post<null>(`${API.ROOT}/${id}/restore`, undefined, SILENT);
}
