/**
 * ==========================================
 * 菜单搜索 · 共享逻辑（三端共用 composable）
 * ------------------------------------------
 * 注入 + 拍平缓存 + 过滤 + 跳转 + 状态；各端组件只写视图与自有交互
 * ==========================================
 */
import { computed, inject, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

// 引入常量
import { IS_DESKTOP_KEY, IS_TABLET_KEY, IS_MOBILE_KEY, MENU_ITEMS_KEY } from "@/constants";

// 引入菜单搜索工具（纯函数，走聚合出口）
import { flattenMenuItems, filterMenuItems, isExternalUrl } from "@/utils";

import type { FlatMenu, Menu } from "@/types";
import type { Ref } from "vue";

export const useMenuSearch = () => {
  const { t } = useI18n();
  const router = useRouter();

  // 注入：屏幕尺寸 + 菜单数据（layout provide，子组件零 store 依赖）
  const isDesktop = inject<Ref<boolean>>(IS_DESKTOP_KEY, ref(false));
  const isTablet = inject<Ref<boolean>>(IS_TABLET_KEY, ref(false));
  const isMobile = inject<Ref<boolean>>(IS_MOBILE_KEY, ref(false));
  const menuItems = inject<Ref<Menu[]>>(MENU_ITEMS_KEY, ref([]));

  // 状态：关键字 + 展示列表
  const keyword = ref("");
  const filteredMenus = ref<FlatMenu[]>([]);

  // 拍平缓存：菜单数据 → 可跳转项（纯函数，结果缓存复用）
  const flatMenus = computed<FlatMenu[]>(() => flattenMenuItems(menuItems.value));

  // 菜单数据到达/变化 → 展示列表同步全量
  watch(
    flatMenus,
    (list) => {
      filteredMenus.value = list;
    },
    { immediate: true }
  );

  // 过滤：输入即过滤（空关键字 = 全量）
  const handleFilter = (kw: string): void => {
    filteredMenus.value = filterMenuItems(flatMenus.value, kw, t);
  };

  // 跳转：路由跳转 + 重置选中值 + 恢复全量列表（避免下次聚焦残留）
  const handleJump = (path: string): void => {
    if (isExternalUrl(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      router.push(path);
    }
    keyword.value = "";
    filteredMenus.value = flatMenus.value;
  };

  return { t, isDesktop, isTablet, isMobile, keyword, filteredMenus, flatMenus, handleFilter, handleJump };
};
