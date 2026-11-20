import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useThemeStore } from "./style-customize";

const readStored = (key: string) => JSON.parse(localStorage.getItem(`V3T_${key}`) as string).value;

describe("定制样式 store", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("没有本地记录时回落到默认值", () => {
    const store = useThemeStore();
    expect(store.customizeTheme).toBe("Slate");
    expect(store.customizeRadius).toBe(8);
    expect(store.contentWidth).toBe("full");
  });

  it("setter 同时更新状态与本地存储", () => {
    const store = useThemeStore();
    store.setCustomizeTheme("Sapphire");
    store.setRadius(12);
    store.setContentWidth("compact");

    expect(store.customizeTheme).toBe("Sapphire");
    expect(store.customizeRadius).toBe(12);
    expect(store.contentWidth).toBe("compact");

    expect(readStored("customize_theme")).toBe("Sapphire");
    expect(readStored("customize_radius")).toBe(12);
    expect(readStored("customize_content")).toBe("compact");
  });

  it("圆角取 0 档时不会被默认值顶掉", () => {
    useThemeStore().setRadius(0);
    setActivePinia(createPinia());
    expect(useThemeStore().customizeRadius).toBe(0);
  });
});
