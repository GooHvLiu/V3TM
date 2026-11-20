import { describe, expect, it, vi } from "vitest";
import type { Ref } from "vue";
import { createApp, nextTick } from "vue";
import { permission } from "./permission";

const storeMock = vi.hoisted(() => ({
  permissions: null as unknown as Ref<string[]>
}));

vi.mock("@/stores", async () => {
  const { ref: createRef } = await import("vue");
  storeMock.permissions = createRef<string[]>([]);
  return {
    useUserStore: () => ({ permissions: storeMock.permissions })
  };
});

const mountDirective = (template: string) => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = createApp({ template });
  app.directive("permission", permission);
  app.mount(host);
  const button = host.querySelector("button") as HTMLElement;
  return { app, host, button };
};

describe("v-permission", () => {
  it("权限未就绪先隐藏，权限回填后恢复原 display", async () => {
    const { app, host, button } = mountDirective(
      `<button v-permission="'user:add'" style="display:inline-block">新增</button>`
    );

    expect(button.style.display).toBe("none");

    storeMock.permissions.value = ["user:add"];
    await nextTick();
    expect(button.style.display).toBe("inline-block");

    storeMock.permissions.value = [];
    await nextTick();
    expect(button.style.display).toBe("none");

    app.unmount();
    host.remove();
  });

  it("无权限时保持隐藏，不摘除节点", async () => {
    const { app, host, button } = mountDirective(`<button v-permission="'user:delete'">删除</button>`);

    storeMock.permissions.value = ["user:add"];
    await nextTick();

    expect(button.style.display).toBe("none");
    expect(host.querySelector("button")).not.toBeNull();
    app.unmount();
    host.remove();
  });
});
