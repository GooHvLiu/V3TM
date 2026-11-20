/**
 * ==========================================
 * 角色视觉配置
 * ------------------------------------------
 * 一档角色 = 中心盾徽标；无角色或未登记角色时，组件回退首字母与原有外环
 * 徽标以路径源码绘制，不落地 svg 文件；颜色由组件绑定主题主色
 * 新增内置角色：在 ROLE_BADGE 补图形，再到 ROLE_VISUAL 登记一条
 * ==========================================
 */
import { ROLE } from "./role";

/** 徽标图形：路径坐标基于自身的 viewBox */
export interface RoleBadgeShape {
  viewBox: string;
  /** 盾形外轮廓：固定色，不随主题色变化 */
  shield: string;
  /** 盾内图形：随主题色变化，可多段叠加 */
  paths?: string[];
  /** 盾内字形：用文本渲染，避免手写字形失真 */
  glyph?: { text: string; x: number; y: number; fontSize: number };
}

/** 徽标描边宽度：整组共用一条线宽 */
export const BADGE_STROKE = 2;

/** 徽标键：由 ROLE_BADGE 推导，补图形时不必再改联合类型 */
export type RoleBadgeKey = keyof typeof ROLE_BADGE;

/**
 * 徽标在 1024 画布中的绘制区
 * 按盾牌包围盒等比铺满（810 : 990 与 viewBox 的 18 : 22 同比例），四周只留一线边
 */
export const BADGE_BOX = { x: 107, y: 17, width: 810, height: 990 } as const;

/** 盾形底：四档共用，只有内部图形不同 */
const SHIELD = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";

/** 盾的包围盒外扩一个描边宽度，让粗描边不被裁 */
const SHIELD_VIEWBOX = "3 1 18 22";

export const ROLE_BADGE = {
  /** 超级管理员：盾 + 大写 S */
  shieldS: {
    viewBox: SHIELD_VIEWBOX,
    shield: SHIELD,
    glyph: { text: "S", x: 12, y: 12.2, fontSize: 13 }
  },
  /** 管理员：盾 + 对勾 */
  shieldCheck: {
    viewBox: SHIELD_VIEWBOX,
    shield: SHIELD,
    paths: ["M9 12L11 14L15 10"]
  },
  /** 操作员：盾 + 齿轮环与十字辐条 */
  shieldGear: {
    viewBox: SHIELD_VIEWBOX,
    shield: SHIELD,
    paths: [
      "M12 10A2 2 0 0 0 12 14A2 2 0 0 0 12 10Z",
      "M12 8v2M12 14v2M8 12h2M14 12h2"
    ]
  },
  /** 只读：空盾 */
  shieldPlain: {
    viewBox: SHIELD_VIEWBOX,
    shield: SHIELD
  }
} satisfies Record<string, RoleBadgeShape>;


/**
 * 内置角色的盾内图形
 * 用字符串索引，后端出现自定义角色时不至于整套配置取不到值
 */
export const ROLE_VISUAL: Record<string, RoleBadgeKey> = {
  [ROLE.SUPER_ADMIN]: "shieldS",
  [ROLE.ADMIN]: "shieldCheck",
  [ROLE.OPERATOR]: "shieldGear",
  [ROLE.VIEWER]: "shieldPlain"
};
