/**
 * ==========================================
 * 菜单接口 Mock
 * ------------------------------------------
 * 以 seed 深拷贝作为运行期树：写操作直接落到这棵树上，
 * /menu/* 与 /auth/profile 共用同一份数据，改动才能反映到侧边栏
 * ==========================================
 */
import type { AxiosRequestConfig } from "axios";
import { mockError, parseBody } from "@/mocks/utils";
import { mockMenuData } from "@/mocks/menus";
import type { DeletedMenuDto, MenuDto, MenuFormPayload, MenuTreeNode } from "@/types";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const nowIso = (): string => new Date().toISOString();
const INTERNAL_PATH = /^\/(?!\/)/;
const EXTERNAL_PATH = /^https?:\/\/\S+$/i;

/** 补齐可空字段与 children，规避历史节点缺字段导致的渲染分支 */
const normalize = (node: MenuTreeNode): MenuTreeNode => ({
  ...node,
  menu_group: node.menu_group ?? "",
  path: node.path ?? "",
  component: node.component ?? "",
  icon: node.icon ?? "",
  permission: node.permission ?? "",
  children: (node.children ?? []).map(normalize)
});

const tree: MenuTreeNode[] = clone(mockMenuData).map(normalize);
const deleted: DeletedMenuDto[] = [];
let autoId = 3001;

const walk = (
  nodes: MenuTreeNode[],
  visit: (node: MenuTreeNode, parent: MenuTreeNode | null) => void,
  parent: MenuTreeNode | null = null
): void => {
  nodes.forEach((node) => {
    visit(node, parent);
    if (node.children?.length) walk(node.children, visit, node);
  });
};

const findNode = (id: number): { node: MenuTreeNode; parent: MenuTreeNode | null } | null => {
  let hit: { node: MenuTreeNode; parent: MenuTreeNode | null } | null = null;
  walk(tree, (node, parent) => {
    if (node.id === id) hit = { node, parent };
  });
  return hit;
};

const childrenOf = (parentId: number): MenuTreeNode[] => {
  if (parentId === 0) return tree;
  const hit = findNode(parentId);
  return hit ? (hit.node.children ?? []) : [];
};

const sortChildren = (parentId: number): void => {
  childrenOf(parentId).sort((a, b) => a.sort - b.sort || a.id - b.id);
};

const attach = (node: MenuTreeNode): void => {
  node.children = node.children ?? [];
  childrenOf(node.parentId).push(node);
  sortChildren(node.parentId);
};

const detach = (id: number): MenuTreeNode | null => {
  const hit = findNode(id);
  if (!hit) return null;
  const list = hit.parent ? (hit.parent.children ?? []) : tree;
  const index = list.findIndex((node) => node.id === id);
  if (index < 0) return null;
  const [node] = list.splice(index, 1);
  return node;
};

type Draft = Required<Omit<MenuFormPayload, "type">> & { type: MenuFormPayload["type"] };

const draftOf = (body: Partial<MenuFormPayload>, base?: MenuTreeNode): Draft => ({
  parentId: body.parentId ?? base?.parentId ?? 0,
  name: (body.name ?? base?.name ?? "").trim(),
  type: body.type ?? base?.type ?? "MENU",
  path: (body.path ?? base?.path ?? "").trim(),
  component: (body.component ?? base?.component ?? "").trim(),
  permission: (body.permission ?? base?.permission ?? "").trim(),
  icon: (body.icon ?? base?.icon ?? "").trim(),
  menu_group: (body.menu_group ?? base?.menu_group ?? "").trim(),
  sort: body.sort ?? base?.sort ?? 0,
  status: body.status ?? base?.status ?? 1,
  visible: body.visible ?? base?.visible ?? 1
});

const assertRules = (draft: Draft): void => {
  if (!draft.name) throw mockError(10003, "PARAM_INVALID", { field: "name" });
  if (draft.name.length > 50) throw mockError(10003, "PARAM_INVALID", { field: "name" });
  if (draft.path.length > 200) throw mockError(10003, "PARAM_INVALID", { field: "path" });
  if (draft.permission.length > 100) throw mockError(10003, "PARAM_INVALID", { field: "permission" });

  if (draft.parentId !== 0) {
    const parent = findNode(draft.parentId);
    if (!parent) throw mockError(40010, "MENU_PARENT_DELETED");
    if (parent.node.type === "BUTTON") throw mockError(10003, "PARAM_INVALID", { field: "parentId" });
  }

  // BUTTON：父级非 0、path/component 必须为空、permission 必填
  if (draft.type === "BUTTON") {
    if (draft.parentId === 0) throw mockError(10003, "PARAM_INVALID", { field: "parentId" });
    if (draft.path) throw mockError(10003, "PARAM_INVALID", { field: "path" });
    if (draft.component) throw mockError(10003, "PARAM_INVALID", { field: "component" });
    if (!draft.permission) throw mockError(10003, "PARAM_INVALID", { field: "permission" });
    return;
  }

  if (!draft.path) throw mockError(10003, "PARAM_INVALID", { field: "path" });

  // 外链：path 必须 http(s)://，component 必须为空
  if (EXTERNAL_PATH.test(draft.path)) {
    if (draft.component) throw mockError(10003, "PARAM_INVALID", { field: "component" });
    return;
  }

  // 站内：/ 开头、无尾斜杠、无 //、无空白
  if (
    !INTERNAL_PATH.test(draft.path) ||
    draft.path.endsWith("/") ||
    draft.path.includes("//") ||
    /\s/.test(draft.path)
  ) {
    throw mockError(10003, "PARAM_INVALID", { field: "path" });
  }
  if (draft.type === "MENU" && !draft.component) throw mockError(10003, "PARAM_INVALID", { field: "component" });
  if (draft.type === "MENU" && !draft.permission) throw mockError(10003, "PARAM_INVALID", { field: "permission" });
};

/** 未删除菜单内：name 同父级唯一、path 全局唯一、permission 全局唯一 */
const assertUnique = (draft: Draft, selfId?: number): void => {
  if (childrenOf(draft.parentId).some((node) => node.id !== selfId && node.name === draft.name)) {
    throw mockError(40006, "MENU_EXIST");
  }
  let pathTaken = false;
  let permissionTaken = false;
  walk(tree, (node) => {
    if (node.id === selfId) return;
    if (draft.path && node.path === draft.path) pathTaken = true;
    if (draft.permission && node.permission === draft.permission) permissionTaken = true;
  });
  if (permissionTaken) throw mockError(40008, "MENU_PERMISSION_EXIST");
  if (pathTaken) throw mockError(40009, "MENU_PATH_EXIST");
};

const toDto = (node: MenuTreeNode, stamp: string): MenuDto => ({
  id: node.id,
  parentId: node.parentId,
  name: node.name,
  type: node.type,
  path: node.path || null,
  component: node.component || null,
  icon: node.icon || null,
  menu_group: node.menu_group || null,
  permission: node.permission || null,
  sort: node.sort,
  status: node.status,
  visible: node.visible,
  createdAt: stamp,
  updatedAt: stamp
});

const toTree = (draft: Draft, id: number): MenuTreeNode => ({
  id,
  parentId: draft.parentId,
  name: draft.name,
  type: draft.type,
  menu_group: draft.menu_group,
  path: draft.path,
  component: draft.component,
  icon: draft.icon,
  permission: draft.permission,
  sort: draft.sort,
  status: draft.status,
  visible: draft.type === "BUTTON" ? 0 : draft.visible
});

/** 供 profile 读取的运行期树（与 /menu/list 同一份数据） */
export const getMenuTree = (): MenuTreeNode[] => tree;

/** GET /v1/menu/tree：仅 DIR/MENU 且 status=1、visible=1 */
export const mockMenuTreeForUser = (): MenuTreeNode[] => {
  const filter = (nodes: MenuTreeNode[]): MenuTreeNode[] =>
    nodes
      .filter((node) => node.type !== "BUTTON" && node.status === 1 && node.visible === 1)
      .map((node) => ({ ...node, children: filter(node.children ?? []) }));
  return filter(clone(tree));
};

/** GET /v1/menu/list：全量树（含 BUTTON / 禁用 / 隐藏） */
export const mockMenuList = (): MenuTreeNode[] => clone(tree);

/** GET /v1/menu/deleted：按删除时间倒序 */
export const mockMenuDeleted = (): DeletedMenuDto[] =>
  [...deleted].sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));

/** POST /v1/menu */
export const mockMenuCreate = (config: AxiosRequestConfig): { id: number } => {
  const draft = draftOf(parseBody<Partial<MenuFormPayload>>(config));
  assertRules(draft);
  assertUnique(draft);
  const node = toTree(draft, autoId++);
  attach(node);
  return { id: node.id };
};

/** PUT /v1/menu/:id：按入参合并，只传 sort 也能正确落库 */
export const mockMenuUpdate = (config: AxiosRequestConfig): null => {
  const id = Number((config.params as { id?: string } | undefined)?.id);
  const hit = findNode(id);
  if (!hit) throw mockError(40001, "MENU_NOT_FOUND");

  const draft = draftOf(parseBody<Partial<MenuFormPayload>>(config), hit.node);
  assertRules(draft);
  assertUnique(draft, id);

  const previousParentId = hit.node.parentId;
  if (previousParentId !== draft.parentId) detach(id);
  Object.assign(hit.node, toTree(draft, id));
  if (previousParentId !== draft.parentId) attach(hit.node);
  sortChildren(previousParentId);
  sortChildren(draft.parentId);
  return null;
};

/** DELETE /v1/menu/:id：软删，有子节点 40002 */
export const mockMenuDelete = (config: AxiosRequestConfig): null => {
  const id = Number((config.params as { id?: string } | undefined)?.id);
  const hit = findNode(id);
  if (!hit) throw mockError(40001, "MENU_NOT_FOUND");
  if (hit.node.children?.length) throw mockError(40002, "MENU_HAS_CHILDREN");

  const parentName = hit.node.parentId === 0 ? null : (findNode(hit.node.parentId)?.node.name ?? null);
  detach(id);
  const stamp = nowIso();
  deleted.push({ ...toDto(hit.node, stamp), deletedAt: stamp, parentName });
  return null;
};

/** POST /v1/menu/:id/restore：父先子后，path/permission 被占则拦 */
export const mockMenuRestore = (config: AxiosRequestConfig): null => {
  const id = Number((config.params as { id?: string } | undefined)?.id);
  const index = deleted.findIndex((item) => item.id === id);
  if (index < 0) throw mockError(40011, "MENU_NOT_DELETED");

  const record = deleted[index];
  if (record.parentId !== 0 && !findNode(record.parentId)) throw mockError(40010, "MENU_PARENT_DELETED");

  const draft = draftOf({
    parentId: record.parentId,
    name: record.name ?? "",
    type: record.type,
    path: record.path ?? "",
    component: record.component ?? "",
    permission: record.permission ?? "",
    icon: record.icon ?? "",
    menu_group: record.menu_group ?? "",
    sort: record.sort,
    status: record.status,
    visible: record.visible
  });

  let pathTaken = false;
  let permissionTaken = false;
  walk(tree, (node) => {
    if (draft.path && node.path === draft.path) pathTaken = true;
    if (draft.permission && node.permission === draft.permission) permissionTaken = true;
  });
  if (permissionTaken) throw mockError(40008, "MENU_PERMISSION_EXIST");
  if (pathTaken) throw mockError(40009, "MENU_PATH_EXIST");

  deleted.splice(index, 1);
  attach(toTree(draft, id));
  return null;
};
