/* 控件尺寸别名：新语义 sm/md/lg 与 Element Plus 旧档位统一在这里映射 */
export type ControlSize = "sm" | "md" | "lg" | "small" | "default" | "large";
export type ElementSize = "small" | "default" | "large";

const CONTROL_SIZE_MAP: Record<ControlSize, ElementSize> = {
  sm: "small",
  small: "small",
  md: "default",
  default: "default",
  lg: "large",
  large: "large"
};

export function resolveControlSize(size: ControlSize): ElementSize {
  return CONTROL_SIZE_MAP[size];
}
