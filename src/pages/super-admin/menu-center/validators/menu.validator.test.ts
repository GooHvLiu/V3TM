import { describe, expect, it } from "vitest";
import { buildMenuValidator } from "./menu.validator";
import type { MenuTreeNode } from "@/types";

const node = (patch: Partial<MenuTreeNode>): MenuTreeNode => ({
  id: 1,
  parentId: 0,
  name: "系统管理",
  type: "MENU",
  menu_group: null,
  path: "/system",
  component: "system/index",
  icon: "",
  permission: "system:view",
  sort: 1,
  status: 1,
  visible: 1,
  children: [],
  ...patch
});

const tree: MenuTreeNode[] = [
  node({
    children: [
      node({ id: 2, parentId: 1, name: "用户管理", path: "/system/user", permission: "system:user:list" })
    ]
  })
];

const base = {
  parentId: 0,
  name: "角色管理",
  type: "MENU" as const,
  path: "/system/role",
  component: "system/role/index",
  permission: "system:role:list",
  external: false
};

const validate = (patch: Record<string, unknown>, mode: "create" | "edit" = "create", selfId?: number) =>
  buildMenuValidator({ tree, mode, selfId }).safeParse({ ...base, ...patch });

const pathsOf = (result: ReturnType<typeof validate>): string[] =>
  result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));

describe("buildMenuValidator", () => {
  it("通过完整字段", () => {
    expect(validate({}).success).toBe(true);
  });

  it("站内菜单必须有路径和组件", () => {
    expect(pathsOf(validate({ path: "", component: "" }))).toEqual(["path", "component"]);
  });

  it("按钮必须挂在上级菜单下", () => {
    expect(pathsOf(validate({ type: "BUTTON", parentId: 0, path: "", component: "" }))).toEqual(["parentId"]);
  });

  it("同级重名、路径与权限码重复都会被拦下", () => {
    expect(
      pathsOf(validate({ parentId: 1, name: "用户管理", path: "/system/user", permission: "system:user:list" }))
    ).toEqual(["name", "path", "permission"]);
  });

  it("编辑时跳过自身", () => {
    expect(validate({ name: "用户管理", path: "/system/user", permission: "system:user:list" }, "edit", 2).success).toBe(
      true
    );
  });
});
