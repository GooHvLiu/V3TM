import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { Menu } from "@/types";

vi.mock("@/api", () => ({
  getProfile: vi.fn()
}));

vi.mock("@/router/dynamic", () => ({
  registerDynamicRoutes: vi.fn(() => ["warn"]),
  resetDynamicRoutes: vi.fn()
}));

import { getProfile } from "@/api";
import { registerDynamicRoutes, resetDynamicRoutes } from "@/router/dynamic";
import { useMenuStore } from "./menu";

const menu = (overrides: Partial<Menu> = {}): Menu => ({
  id: 1,
  parentId: 0,
  name: "menu.system.user",
  type: "MENU",
  menu_group: "menu.group.system",
  path: "/system/user",
  component: "system/user/index",
  icon: "user",
  permission: "system:user:list",
  sort: 10,
  status: 1,
  visible: 1,
  ...overrides
});

describe("menu store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("写入菜单时剔除按钮、隐藏与停用节点", () => {
    const store = useMenuStore();

    store.setMenus([
      menu({ id: 1 }),
      menu({ id: 2, visible: 0 }),
      menu({ id: 3, status: 0 }),
      menu({ id: 4, type: "BUTTON" })
    ]);

    expect(store.menuDataArry).toHaveLength(1);
    expect(store.groupedMenus[0]?.title).toBe("menu.group.system");
  });

  it("清空菜单会撤销动态路由并复位 routesReady", () => {
    const store = useMenuStore();
    store.markRoutesReady();

    store.setMenus([]);

    expect(resetDynamicRoutes).toHaveBeenCalledTimes(1);
    expect(store.routesReady).toBe(false);
    expect(store.menuDataArry).toEqual([]);
  });

  it("reloadMenus 从 profile 取菜单并重建路由", async () => {
    const store = useMenuStore();
    vi.mocked(getProfile).mockResolvedValue({ menus: [menu()] } as Awaited<ReturnType<typeof getProfile>>);

    const warns = await store.reloadMenus();

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(registerDynamicRoutes).toHaveBeenCalledWith(store.menuDataArry);
    expect(store.routesReady).toBe(true);
    expect(warns).toEqual(["warn"]);
  });
});
