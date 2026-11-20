// ProForm 公共类型：字段配置、模型与实例方法
import type { FormItemRule } from "element-plus";

/** 表单模型：字段名到值的映射，父组件持有，子组件只读 */
export type ProFormModel = Record<string, unknown>;

/** 控件类型：覆盖后台表单与查询区常用输入 */
export type ProFormControl =
  | "input"
  | "password"
  | "textarea"
  | "select"
  | "switch"
  | "number"
  | "daterange";

/** 下拉选项 */
export interface ProFormOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

/** 字段配置：一个字段对应一个 el-form-item */
export interface ProFormField {
  /** 字段名，同时作为校验与错误回显的 key */
  prop: string;
  /** 标签，查询区可不填 */
  label?: string;
  /** 控件类型，默认 input */
  type?: ProFormControl;
  /** 占位文案 */
  placeholder?: string;
  /** 控件的可访问名称；查询区无可见标签时用它兜底，缺省取 placeholder，再取 label */
  ariaLabel?: string;
  /** 下拉选项 */
  options?: ProFormOption[];
  /** 是否多选 */
  multiple?: boolean;
  /** 文本域行数 */
  rows?: number;
  /** 栅格跨度，范围 1-24，默认 24 */
  span?: number;
  /** 控件宽度，查询区使用 */
  width?: number | string;
  /** 是否禁用，支持按当前模型计算 */
  disabled?: boolean | ((model: ProFormModel) => boolean);
  /** 是否隐藏，支持按当前模型计算 */
  hidden?: boolean | ((model: ProFormModel) => boolean);
  /** 是否必填，仅用于星号展示，实际校验由 rules 决定 */
  required?: boolean;
  /** 字段说明，展示在控件下方 */
  tip?: string;
  /** 字段级校验规则，与表单级 rules 合并 */
  rules?: FormItemRule | FormItemRule[];
  /** 开关选中值 */
  activeValue?: string | number | boolean;
  /** 开关未选中值 */
  inactiveValue?: string | number | boolean;
  /** 开关选中文案 */
  activeText?: string;
  /** 开关未选中文案 */
  inactiveText?: string;
  /** 数字输入最小值 */
  min?: number;
  /** 数字输入最大值 */
  max?: number;
  /** 数字输入步长 */
  step?: number;
  /** 日期范围开始占位 */
  startPlaceholder?: string;
  /** 日期范围结束占位 */
  endPlaceholder?: string;
  /** 是否可清空，默认 true */
  clearable?: boolean;
}

/** 对外暴露的表单实例方法 */
export interface ProFormInstance {
  validate: () => Promise<boolean>;
  clearValidate: () => void;
  resetFields: () => void;
}
