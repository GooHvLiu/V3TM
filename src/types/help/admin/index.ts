/**
 * 知识库管理数据结构
 * 字段与后端 v2 管理接口一一对应
 */

/** 文档文件类型 */
export type HelpFileType = "md" | "pdf";

/** 文档位状态：已发布 / 待上传 / 待重建索引 */
export type HelpDocStatus = "published" | "empty" | "stale";

/** 语言索引状态 */
export type HelpIndexState = "clean" | "stale" | "missing";

/** 版块来源 */
export type HelpSectionSource = "template" | "custom";

/** manifest 中的文档节点 */
export interface ManifestDocNode {
  type: "doc";
  key: string;
  title: string;
  summary?: string;
  sort: number;
  file: string;
  path?: string;
  contentType: HelpFileType;
}

/** manifest 中的章节节点 */
export interface ManifestChapterNode {
  type: "chapter";
  key: string;
  title: string;
  sort: number;
  children: ManifestDocNode[];
}

/** manifest 中的版块节点 */
export interface ManifestSectionNode {
  type: "section";
  key: string;
  title: string;
  sort: number;
  source?: HelpSectionSource;
  children: Array<ManifestChapterNode | ManifestDocNode>;
}

/** 单语言 manifest */
export interface HelpManifest {
  schemaVersion: number;
  locale: string;
  title: string;
  tree: ManifestSectionNode[];
}

/** 语言列表项 */
export interface AdminLocaleItem {
  locale: string;
  /** 磁盘上的第一层目录名 */
  dirName: string;
  title: string;
  manifestExists: boolean;
  manifestValid: boolean;
  /** manifest 非法时的错误标识，正常为 null */
  manifestError: string | null;
  docCount: number;
  publishedCount: number;
  emptyCount: number;
  staleCount: number;
  orphanCount: number;
  indexedCount: number;
  indexState: HelpIndexState;
  lastIndexedAt: string | null;
}

/** 语言列表：直接返回数组 */
export type AdminLocaleListResult = AdminLocaleItem[];

/** 语言初始化结果 */
export interface AdminLocaleInitResult {
  locale: string;
  /** false 表示 manifest 已存在，未覆盖 */
  created: boolean;
  manifestPath: string;
  manifest: HelpManifest;
}

/** 语言改名 / 改展示名入参 */
export interface AdminLocaleUpdateBody {
  /** 新目录名；缺省或空串表示不改目录 */
  newLocale?: string;
  /** 展示名；缺省保留原值，空串表示移除自定义名 */
  title?: string;
}

/** 语言改名结果 */
export interface AdminLocaleUpdateResult {
  previousLocale: string;
  /** true 表示目录与索引已迁移 */
  renamed: boolean;
  locale: AdminLocaleItem;
}

/** 语言删除结果；物理删除，不落回收站 */
export interface AdminLocaleDeleteResult {
  locale: string;
  status: "deleted";
  docCount: number;
  removedIndexRows: number;
}

/** 文档位节点（带运行时状态） */
export interface AdminDocNode {
  type: "doc";
  key: string;
  title: string;
  summary: string;
  sort: number;
  file: string;
  path: string;
  contentType: HelpFileType;
  status: HelpDocStatus;
  hash: string;
  size: number;
  fileUpdatedAt: string | null;
  indexedAt: string | null;
}

/** 章节节点 */
export interface AdminChapterNode {
  type: "chapter";
  key: string;
  title: string;
  sort: number;
  children: AdminDocNode[];
}

/** 版块节点 */
export interface AdminSectionNode {
  type: "section";
  key: string;
  title: string;
  sort: number;
  source?: HelpSectionSource;
  children: Array<AdminChapterNode | AdminDocNode>;
}

/** 未登记入 manifest 的文件 */
export interface AdminOrphanFile {
  file: string;
  contentType: HelpFileType;
  size: number;
  mtime: string;
  title: string;
}

/** 单语言统计 */
export interface AdminSlotSummary {
  sectionCount: number;
  chapterCount: number;
  docCount: number;
  publishedCount: number;
  emptyCount: number;
  staleCount: number;
  orphanCount: number;
}

/** 单语言索引概况 */
export interface AdminSlotIndex {
  locale: string;
  indexedCount: number;
  docCount: number;
  publishedCount: number;
  emptyCount: number;
  staleCount: number;
  orphanCount: number;
  state: HelpIndexState;
  lastIndexedAt: string | null;
}

/** 文档位列表 */
export interface AdminSlotListResult {
  locale: string;
  title: string;
  manifestExists: boolean;
  manifestPath: string;
  tree: AdminSectionNode[];
  orphans: AdminOrphanFile[];
  summary: AdminSlotSummary;
  index: AdminSlotIndex;
}

/** 文档详情 */
export interface AdminDocDetail extends Omit<AdminDocNode, "type"> {
  type: "doc";
  section: { key: string; title: string };
  chapter: { key: string; title: string } | null;
}

/** 文档正文 */
export interface AdminDocContentResult {
  docKey: string;
  contentType: HelpFileType;
  /** md 返回去掉 frontmatter 的正文；pdf 返回抽取文本 */
  content: string;
  hash: string;
  size: number;
  /** 乐观并发基线 */
  baseHash: string;
}

/** 正文保存结果 */
export interface AdminDocSaveResult {
  docKey: string;
  status: "published" | "stale";
  path: string;
  hash: string;
  size: number;
  indexedAt: string | null;
}

/** 删除文档位结果 */
export interface AdminSlotDeleteResult {
  docKey: string;
  status: "deleted";
  trashedFile: string | null;
}

/** 清空正文结果 */
export interface AdminDocClearResult {
  docKey: string;
  status: "empty";
  trashedFile: string | null;
}

/** 文件名候选 */
export interface AdminFileOption {
  file: string;
  contentType: HelpFileType;
  size: number;
  mtime: string;
  title: string;
  used: boolean;
  docKey: string | null;
}

/** 文件名候选列表 */
export interface AdminFileOptionsResult {
  locale: string;
  list: AdminFileOption[];
  total: number;
  page: number;
  pageSize: number;
}

/** 新建文档位：版块与章节随文档一并落地 */
export interface AdminSlotCreateBody {
  locale?: string;
  /** 已存在则复用，不存在则按 sectionTitle 新建 */
  sectionKey: string;
  sectionTitle?: string;
  sectionSort?: number;
  sectionSource?: HelpSectionSource;
  /** 传了则在版块下找或建章节 */
  chapterKey?: string;
  chapterTitle?: string;
  chapterSort?: number;
  key: string;
  title: string;
  summary?: string;
  sort?: number;
  file: string;
  contentType: HelpFileType;
  path?: string;
}

/** 修改文档位展示信息 */
export interface AdminSlotUpdateBody {
  title?: string;
  summary?: string;
  sort?: number;
  /** 空串表示删除自定义 path，回退按 file 生成 */
  path?: string;
}

/** 图片资源上传结果 */
export interface AdminAssetResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

/** 全量重建索引结果 */
export interface AdminReindexResult {
  count: number;
  localeCount: number;
  skipped: number;
}

/** 索引状态汇总 */
export interface AdminIndexStatusResult {
  locales: AdminSlotIndex[];
  summary: {
    localeCount: number;
    docCount: number;
    indexedCount: number;
    staleCount: number;
    orphanCount: number;
    emptyCount: number;
  };
}
