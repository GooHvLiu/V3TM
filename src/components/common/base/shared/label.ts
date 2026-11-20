import { useI18n } from "vue-i18n";
import zhCommon from "@/locales/zh-cn/common/common";

/* 基础组件的默认文案：当前语言优先；文档站和单测里没有挂 i18n 实例时退回中文包。
 * 组件只引用 key，文案本身仍由语言包维护。 */
const ZH_LABELS = zhCommon as Record<string, unknown>;

export type LabelKey =
  | "confirm"
  | "cancel"
  | "retry"
  | "backHome"
  | "empty"
  | "loadFailed"
  | "loadFailedHint"
  | "errorCode"
  | "chartAriaLabel";

export function useLabel(): (key: LabelKey) => string {
  let translate: ((key: string) => string) | undefined;

  try {
    translate = useI18n().t as (key: string) => string;
  } catch {
    translate = undefined;
  }

  return (key) => {
    if (translate) {
      const text = translate(`common.${key}`);
      /* key 原样返回说明语言包里没有这条，继续走下面的回退 */
      if (text && text !== `common.${key}`) return text;
    }
    const fallback = ZH_LABELS[key];
    return typeof fallback === "string" ? fallback : key;
  };
}
