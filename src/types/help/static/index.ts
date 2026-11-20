/**
 * 帮助中心数据结构
 */
export interface HelpArticle {
  /** 唯一标识：相对 src/help 的路径 */
  path: string;
  title: string;
  summary: string;
  /** Markdown 正文 */
  content: string;
  sort: number;
}

export interface HelpChapter {
  title: string;
  sort: number;
  articles: HelpArticle[];
}

export interface HelpSection {
  title: string;
  sort: number;
  /** 来源：模板内置 / 定制项目 */
  source: "template" | "custom";
  chapters: HelpChapter[];
  /** 版块下直接挂的文章（无章节时） */
  articles: HelpArticle[];
}

export interface HelpTree {
  sections: HelpSection[];
}
