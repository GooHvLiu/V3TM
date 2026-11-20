import { describe, expect, it } from "vitest";
import { checkI18nKeys, checkLocaleParity } from "./i18n-check";

describe("i18n 词条完整性", () => {
  it("后端固定标识与错误码在中文语言包内均可解析", () => {
    expect(checkI18nKeys()).toEqual([]);
  });

  it("中英语言包结构一致，插值占位符同名", () => {
    expect(checkLocaleParity()).toEqual([]);
  });
});
