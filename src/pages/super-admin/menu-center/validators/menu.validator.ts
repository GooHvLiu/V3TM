/**
 * 菜单表单 · zod 校验
 * --------------------
 * 字段格式与「同级重名 / 路径重复 / 权限标识重复」放在同一份 schema，
 * 页面只需把校验结果映射到表单项。
 */
import { z } from "zod";
import { findMenuNode, isExternalPath, isValidExternalPath, isValidInternalPath, walkMenu } from "../status";
import type { MenuTreeNode } from "@/types";

interface MenuValidationContext {
  tree: MenuTreeNode[];
  mode: "create" | "edit";
  selfId?: number;
}

const childrenOf = (tree: MenuTreeNode[], parentId: number): MenuTreeNode[] => {
  if (parentId === 0) return tree;
  return findMenuNode(tree, parentId)?.children ?? [];
};

const allNodes = (tree: MenuTreeNode[]): MenuTreeNode[] => {
  const nodes: MenuTreeNode[] = [];
  walkMenu(tree, (node) => nodes.push(node));
  return nodes;
};

/** 按当前菜单树生成校验 schema：重名判断要拿到同级节点，不能做成静态规则 */
export const buildMenuValidator = ({ tree, mode, selfId }: MenuValidationContext) =>
  z
    .object({
      parentId: z.number().int().min(0),
      name: z.string().trim().min(1, { message: "menuCenter.form.required" }).max(50, { message: "menuCenter.form.nameMax" }),
      type: z.enum(["DIR", "MENU", "BUTTON"]),
      path: z.string().trim(),
      component: z.string().trim(),
      permission: z.string().trim(),
      external: z.boolean()
    })
    .superRefine((data, ctx) => {
      if (data.type === "BUTTON" && data.parentId === 0) {
        ctx.addIssue({ code: "custom", path: ["parentId"], message: "menuCenter.form.parentRequired" });
      }

      if (data.type !== "BUTTON") {
        if (!data.path) {
          ctx.addIssue({ code: "custom", path: ["path"], message: "menuCenter.form.pathRequired" });
        } else if (isExternalPath(data.path)) {
          if (!isValidExternalPath(data.path)) {
            ctx.addIssue({ code: "custom", path: ["path"], message: "menuCenter.form.pathExternalFormat" });
          }
        } else if (!isValidInternalPath(data.path)) {
          ctx.addIssue({ code: "custom", path: ["path"], message: "menuCenter.form.pathFormat" });
        }

        if (data.type === "MENU" && !data.external && !data.component) {
          ctx.addIssue({ code: "custom", path: ["component"], message: "menuCenter.form.componentRequired" });
        }
      }

      if (data.type !== "DIR" && !data.permission) {
        ctx.addIssue({ code: "custom", path: ["permission"], message: "menuCenter.form.permissionRequired" });
      }

      const currentId = mode === "edit" ? selfId : undefined;
      if (
        data.name &&
        childrenOf(tree, data.parentId).some((node) => node.id !== currentId && node.name === data.name)
      ) {
        ctx.addIssue({ code: "custom", path: ["name"], message: "error.MENU_EXIST" });
      }
      if (data.path && allNodes(tree).some((node) => node.id !== currentId && node.path === data.path)) {
        ctx.addIssue({ code: "custom", path: ["path"], message: "error.MENU_PATH_EXIST" });
      }
      if (
        data.permission &&
        allNodes(tree).some((node) => node.id !== currentId && node.permission === data.permission)
      ) {
        ctx.addIssue({ code: "custom", path: ["permission"], message: "error.MENU_PERMISSION_EXIST" });
      }
    });
