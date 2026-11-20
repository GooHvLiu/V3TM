import {
  Aim,
  Crop,
  DataLine,
  FullScreen,
  Grid,
  Menu,
  Odometer,
  Postcard,
  Setting,
  Tickets,
  Warning
} from "@element-plus/icons-vue";
import type { Component } from "vue";

/**
 * 菜单图标登记表
 * 后端只存 Element Plus 组件名，模板里的动态 :is 不会触发自动导入，
 * 因此在这里把菜单可用图标显式登记，新增图标时同步补一项。
 */
const menuIcons: Record<string, Component> = {
  Aim,
  Crop,
  DataLine,
  FullScreen,
  Grid,
  Menu,
  Odometer,
  Postcard,
  Setting,
  Tickets,
  Warning
};

/**
 * 按组件名取菜单图标
 * 空名称返回 null，保持子菜单的缩进留白；未登记名称回退通用图标并在开发期提示
 */
export const resolveMenuIcon = (name?: string | null): Component | null => {
  if (!name) return null;
  const icon = menuIcons[name];
  if (!icon && import.meta.env.DEV) {
    console.warn(`[menu] 未登记的图标：${name}`);
  }
  return icon ?? Menu;
};
