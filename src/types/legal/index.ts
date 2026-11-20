/** 法律文档章节 */
export interface LegalSection {
  id: string; // 章节编号（如 "section1"）
  title: string; // 章节标题（已翻译）
  paragraphs: string[]; // 章节段落（已翻译）
}

/** 法律文档数据（页面组装好后传给纯 UI 组件） */
export interface LegalDocData {
  title: string; // 文档标题
  version: string; // 版本号
  updateDate: string; // 更新日期
  effectiveDate?: string; // 生效日期（可选，未填写不展示）
  intro?: string; // 引言
  sections: LegalSection[];
}
