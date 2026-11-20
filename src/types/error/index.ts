/** 错误页数据（页面组装后传给纯 UI 组件） */
export interface ErrorPageType {
  code: number; // 错误码
  subtitle: string; // 副标题（已翻译）
  description: string; // 描述（已翻译）
}
