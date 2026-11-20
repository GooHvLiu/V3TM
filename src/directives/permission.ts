/**
 * ==========================================
 * v-permission：按钮级权限指令
 * ------------------------------------------
 * 用法：
 *   v-permission="'adminCenter:user:list'"       单权限
 *   v-permission="['a:list', 'a:update']"        任一权限
 * 权限未就绪（空数组）→ 先隐藏，防「先显示后消失」闪变
 * 权限就绪 → 有权限恢复原 display；无权限保持隐藏，不摘除节点
 * ==========================================
 */
import type { Directive, EffectScope } from "vue";
import { effectScope, watch } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores";
import { hasPermission } from "@/utils";

const scopes = new WeakMap<HTMLElement, EffectScope>();

export const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const originalDisplay = el.style.display;
    const { permissions } = storeToRefs(useUserStore());

    const update = (): void => {
      if (permissions.value.length === 0) {
        el.style.display = "none";
        return;
      }
      el.style.display = hasPermission(permissions.value, binding.value)
        ? originalDisplay
        : "none";
    };

    update();

    const scope = effectScope();
    scope.run(() => {
      watch(permissions, update, { flush: "post" });
    });
    scopes.set(el, scope);
  },
  unmounted(el) {
    scopes.get(el)?.stop();
    scopes.delete(el);
  }
};
