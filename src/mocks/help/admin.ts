/**
 * 知识库管理 · Mock 数据
 * 与后端 /v1/help/admin/* 契约一致：树节点用 key / hash / fileUpdatedAt，
 * 删除与清空必须带 confirm，正文保存走 multipart。
 */
import type {
  AdminChapterNode,
  AdminDocContentResult,
  AdminDocDetail,
  AdminDocNode,
  AdminDocSaveResult,
  AdminFileOption,
  AdminFileOptionsResult,
  AdminIndexStatusResult,
  AdminLocaleDeleteResult,
  AdminLocaleItem,
  AdminLocaleInitResult,
  AdminLocaleUpdateBody,
  AdminLocaleUpdateResult,
  AdminOrphanFile,
  AdminReindexResult,
  AdminSectionNode,
  AdminSlotCreateBody,
  AdminSlotIndex,
  AdminSlotListResult,
  AdminSlotSummary,
  AdminSlotUpdateBody,
  HelpDocStatus,
  HelpFileType,
  HelpIndexState,
  HelpSectionSource
} from "@/types/help/admin";
import { mockError, parseBody } from "../utils";

/** 文档位在内存中额外保留正文与所属容器 */
interface MockAdminDoc extends AdminDocNode {
  content: string;
  sectionKey: string;
  sectionTitle: string;
  sectionSort: number;
  sectionSource: HelpSectionSource;
  chapterKey: string | null;
  chapterTitle: string;
  chapterSort: number;
}

interface MockAdminLocale {
  locale: string;
  dirName: string;
  title: string;
  manifestExists: boolean;
  manifestValid: boolean;
  manifestError: string | null;
  docs: MockAdminDoc[];
  orphans: AdminOrphanFile[];
}

interface MockRequest {
  params?: Record<string, string>;
  data?: unknown;
}

const T1 = "2026-11-09T06:10:00.000Z";
const T2 = "2026-11-09T06:17:00.000Z";

/** file 去掉扩展名与首层目录，得到用户帮助页路径 */
const pathOf = (file: string): string =>
  file
    .replace(/\.(md|pdf)$/i, "")
    .replace(/^(template|custom)\//, "");

const hashOf = (key: string): string => `mock-hash-${key}`;

const docOf = (input: {
  key: string;
  title: string;
  file: string;
  contentType?: HelpFileType;
  section: { key: string; title: string; sort: number; source: HelpSectionSource };
  chapter?: { key: string; title: string; sort: number };
  summary?: string;
  sort?: number;
  content?: string;
  status?: HelpDocStatus;
  indexedAt?: string | null;
}): MockAdminDoc => {
  const content = input.content ?? "";
  return {
    type: "doc",
    key: input.key,
    title: input.title,
    summary: input.summary ?? "",
    sort: input.sort ?? 1,
    file: input.file,
    path: pathOf(input.file),
    contentType: input.contentType ?? "md",
    status: input.status ?? (content ? "published" : "empty"),
    hash: hashOf(input.key),
    size: content.length,
    fileUpdatedAt: content ? T1 : null,
    indexedAt: input.indexedAt ?? (input.status === "stale" ? null : content ? T2 : null),
    content,
    sectionKey: input.section.key,
    sectionTitle: input.section.title,
    sectionSort: input.section.sort,
    sectionSource: input.section.source,
    chapterKey: input.chapter?.key ?? null,
    chapterTitle: input.chapter?.title ?? "",
    chapterSort: input.chapter?.sort ?? 0
  };
};

/** 语言目录状态：开发期固定在这几份数据上走查 */
const adminLocales: MockAdminLocale[] = [
  {
    locale: "zh-cn",
    dirName: "zh-cn",
    title: "简体中文",
    manifestExists: true,
    manifestValid: true,
    manifestError: null,
    orphans: [{ file: "custom/20-使用指南/草稿.md", contentType: "md", size: 12, mtime: T1, title: "草稿" }],
    docs: [
      docOf({
        key: "template-10-1",
        title: "系统介绍",
        summary: "一句话摘要",
        file: "template/10-快速上手/01-系统介绍.md",
        section: { key: "template-10", title: "快速上手", sort: 10, source: "template" },
        sort: 1,
        content: "# 系统介绍\n\n正文内容"
      }),
      docOf({
        key: "template-10-2",
        title: "安装与部署",
        file: "template/10-快速上手/02-安装与部署.md",
        section: { key: "template-10", title: "快速上手", sort: 10, source: "template" },
        sort: 2,
        content: "# 安装与部署\n\n正文内容"
      }),
      docOf({
        key: "template-10-3",
        title: "登录与权限",
        file: "template/10-快速上手/03-登录与权限.md",
        section: { key: "template-10", title: "快速上手", sort: 10, source: "template" },
        sort: 3,
        content: "# 登录与权限\n\n正文内容",
        status: "stale"
      }),
      docOf({
        key: "custom-20-1-1",
        title: "新建账号",
        file: "custom/20-使用指南/01-新建账号.md",
        section: { key: "custom-20", title: "使用指南", sort: 20, source: "custom" },
        chapter: { key: "custom-20-1", title: "入门", sort: 1 },
        sort: 1
      }),
      docOf({
        key: "custom-20-1-2",
        title: "导入数据",
        file: "custom/20-使用指南/02-导入数据.md",
        section: { key: "custom-20", title: "使用指南", sort: 20, source: "custom" },
        chapter: { key: "custom-20-1", title: "入门", sort: 1 },
        sort: 2,
        content: "# 导入数据\n\n正文内容"
      })
    ]
  },
  {
    locale: "ja-jp",
    dirName: "ja-jp",
    title: "日本語",
    manifestExists: true,
    manifestValid: true,
    manifestError: null,
    orphans: [],
    docs: [
      docOf({
        key: "ja-10-1",
        title: "システム概要",
        file: "template/10-はじめに/01-システム概要.md",
        section: { key: "ja-10", title: "はじめに", sort: 10, source: "template" },
        sort: 1,
        content: "# システム概要\n\n本文"
      })
    ]
  },
  {
    locale: "en-us",
    dirName: "en-us",
    title: "English",
    manifestExists: false,
    manifestValid: false,
    manifestError: null,
    orphans: [],
    docs: []
  }
];

const findLocale = (locale: string): MockAdminLocale => {
  const target = adminLocales.find((item) => item.locale === locale);
  if (!target) throw mockError(30010, "HELP_LOCALE_NOT_FOUND");
  return target;
};

const findDoc = (locale: string, docKey: string): { state: MockAdminLocale; doc: MockAdminDoc } => {
  const state = findLocale(locale);
  const doc = state.docs.find((item) => item.key === docKey);
  if (!doc) throw mockError(30011, "HELP_SLOT_NOT_FOUND");
  return { state, doc };
};

const toNode = (doc: MockAdminDoc): AdminDocNode => ({
  type: "doc",
  key: doc.key,
  title: doc.title,
  summary: doc.summary,
  sort: doc.sort,
  file: doc.file,
  path: doc.path,
  contentType: doc.contentType,
  status: doc.status,
  hash: doc.hash,
  size: doc.size,
  fileUpdatedAt: doc.fileUpdatedAt,
  indexedAt: doc.indexedAt
});

const toDetail = (doc: MockAdminDoc): AdminDocDetail => ({
  ...toNode(doc),
  section: { key: doc.sectionKey, title: doc.sectionTitle },
  chapter: doc.chapterKey ? { key: doc.chapterKey, title: doc.chapterTitle } : null
});

const bySort = (a: { sort: number }, b: { sort: number }): number => a.sort - b.sort;

/** 按版块、章节聚合文档位 */
const buildTree = (docs: MockAdminDoc[]): AdminSectionNode[] => {
  const sections = new Map<string, { title: string; sort: number; source: HelpSectionSource; docs: MockAdminDoc[] }>();
  docs.forEach((doc) => {
    const section = sections.get(doc.sectionKey) ?? {
      title: doc.sectionTitle,
      sort: doc.sectionSort,
      source: doc.sectionSource,
      docs: []
    };
    section.docs.push(doc);
    sections.set(doc.sectionKey, section);
  });

  return [...sections.entries()]
    .map(([key, section]) => {
      const chapters = new Map<string, { title: string; sort: number; docs: MockAdminDoc[] }>();
      const direct: MockAdminDoc[] = [];
      section.docs.forEach((doc) => {
        if (!doc.chapterKey) {
          direct.push(doc);
          return;
        }
        const chapter = chapters.get(doc.chapterKey) ?? { title: doc.chapterTitle, sort: doc.chapterSort, docs: [] };
        chapter.docs.push(doc);
        chapters.set(doc.chapterKey, chapter);
      });
      const chapterNodes: AdminChapterNode[] = [...chapters.entries()]
        .map(([chapterKey, chapter]) => ({
          type: "chapter" as const,
          key: chapterKey,
          title: chapter.title,
          sort: chapter.sort,
          children: chapter.docs.sort(bySort).map(toNode)
        }))
        .sort(bySort);
      const children: Array<AdminChapterNode | AdminDocNode> = chapterNodes.length
        ? chapterNodes
        : direct.sort(bySort).map(toNode);
      return {
        type: "section" as const,
        key,
        title: section.title,
        sort: section.sort,
        source: section.source,
        children
      };
    })
    .sort(bySort);
};

const countDoc = (docs: MockAdminDoc[]): Pick<
  AdminSlotSummary,
  "docCount" | "publishedCount" | "emptyCount" | "staleCount"
> => ({
  docCount: docs.length,
  publishedCount: docs.filter((doc) => doc.status === "published").length,
  emptyCount: docs.filter((doc) => doc.status === "empty").length,
  staleCount: docs.filter((doc) => doc.status === "stale").length
});

const buildIndex = (state: MockAdminLocale): AdminSlotIndex => {
  const counts = countDoc(state.docs);
  const indexedCount = state.docs.filter((doc) => Boolean(doc.indexedAt)).length;
  const lastIndexedAt = state.docs.reduce<string | null>(
    (latest, doc) => (doc.indexedAt && (!latest || doc.indexedAt > latest) ? doc.indexedAt : latest),
    null
  );
  let indexState: HelpIndexState = "clean";
  if (!state.manifestExists) {
    indexState = "missing";
  } else if (counts.docCount === 0) {
    indexState = "clean";
  } else if (indexedCount === 0) {
    indexState = "missing";
  } else if (counts.staleCount > 0 || state.orphans.length > 0 || indexedCount !== counts.publishedCount) {
    indexState = "stale";
  }
  return {
    locale: state.locale,
    indexedCount,
    docCount: counts.docCount,
    publishedCount: counts.publishedCount,
    emptyCount: counts.emptyCount,
    staleCount: counts.staleCount,
    orphanCount: state.orphans.length,
    state: indexState,
    lastIndexedAt
  };
};

const localeItem = (state: MockAdminLocale): AdminLocaleItem => {
  const counts = countDoc(state.docs);
  const index = buildIndex(state);
  return {
    locale: state.locale,
    dirName: state.dirName,
    title: state.title,
    manifestExists: state.manifestExists,
    manifestValid: state.manifestValid,
    manifestError: state.manifestError,
    docCount: counts.docCount,
    publishedCount: counts.publishedCount,
    emptyCount: counts.emptyCount,
    staleCount: counts.staleCount,
    orphanCount: state.orphans.length,
    indexedCount: index.indexedCount,
    indexState: index.state,
    lastIndexedAt: index.lastIndexedAt
    };
};

/** GET /v1/help/admin/locales */
export const mockAdminLocales = (): AdminLocaleItem[] => adminLocales.map(localeItem);

/** POST /v1/help/admin/locales/:locale/init */
export const mockAdminLocaleInit = (config: MockRequest): AdminLocaleInitResult => {
  const locale = (config.params?.locale ?? "zh-cn").toLowerCase();
  const bodyTitle = parseBody<{ title?: string }>(config).title?.trim();
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(locale)) throw mockError(30010, "HELP_LOCALE_NOT_FOUND");

  // 目录不存在时先落一份空状态，等同于后端建目录；已存在则直接复用
  let state = adminLocales.find((item) => item.locale === locale);
  if (!state) {
    state = {
      locale,
      dirName: locale,
      title: bodyTitle || locale,
      manifestExists: false,
      manifestValid: true,
      manifestError: null,
      docs: [],
      orphans: []
    };
    adminLocales.push(state);
  } else if (bodyTitle) {
    state.title = bodyTitle;
  }
  // manifest 已存在时不覆盖，按契约回 created=false
  if (state.manifestExists) {
    return {
      locale,
      created: false,
      manifestPath: `data/help/${locale}/help.manifest.json`,
      manifest: { schemaVersion: 1, locale, title: state.title, tree: [] }
    };
  }

  state.manifestExists = true;
  state.manifestValid = true;
  return {
    locale,
    created: true,
    manifestPath: `data/help/${locale}/help.manifest.json`,
    manifest: { schemaVersion: 1, locale, title: state.title, tree: [] }
  };
};

/** PATCH /v1/help/admin/locales/:locale */
export const mockAdminLocaleUpdate = (config: MockRequest): AdminLocaleUpdateResult => {
  const raw = (config.params?.locale ?? "").toLowerCase();
  const body = parseBody<AdminLocaleUpdateBody>(config);
  const state = adminLocales.find((item) => item.locale === raw);
  if (!state) throw mockError(30010, "HELP_LOCALE_NOT_FOUND");

  const newLocale = (body.newLocale ?? "").trim().toLowerCase().replace(/_/g, "-");
  let renamed = false;
  if (newLocale && newLocale !== state.locale) {
    if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(newLocale)) throw mockError(30010, "HELP_LOCALE_NOT_FOUND");
    if (adminLocales.some((item) => item.locale === newLocale)) throw mockError(30019, "HELP_LOCALE_CONFLICT");
    // 目录在但没有 manifest 时按空 manifest 处理，仍可改名；只有 manifest 存在且非法才拒绝
    if (state.manifestExists && !state.manifestValid) throw mockError(30014, "HELP_MANIFEST_INVALID");
    // 未显式给展示名时，原本用目录名占位的展示名跟随新目录名
    if (typeof body.title !== "string" && (!state.title || state.title === raw)) state.title = newLocale;
    state.locale = newLocale;
    state.dirName = newLocale;
    renamed = true;
  }
  if (typeof body.title === "string") state.title = body.title.trim();

  return { previousLocale: raw, renamed, locale: localeItem(state) };
};

/** DELETE /v1/help/admin/locales/:locale */
export const mockAdminLocaleDelete = (config: MockRequest): AdminLocaleDeleteResult => {
  const locale = (config.params?.locale ?? "").toLowerCase();
  const confirm = (config.params?.confirm ?? "").toLowerCase();
  const index = adminLocales.findIndex((item) => item.locale === locale);
  if (index < 0) throw mockError(30010, "HELP_LOCALE_NOT_FOUND");
  if (confirm !== locale) throw mockError(30018, "HELP_CONFIRM_REQUIRED");

  const state = adminLocales[index];
  const docCount = state.manifestExists && state.manifestValid ? state.docs.length : 0;
  const removedIndexRows = state.docs.filter((doc) => Boolean(doc.indexedAt)).length;
  adminLocales.splice(index, 1);

  return { locale, status: "deleted", docCount, removedIndexRows };
};

/** 同一路径按 method 分派：PATCH 改名、DELETE 删目录 */
export const mockAdminLocaleItemRoute = (config: MockRequest & { method?: string }) =>
  config.method === "delete" ? mockAdminLocaleDelete(config) : mockAdminLocaleUpdate(config);

/** GET /v1/help/admin/slots */
export const mockAdminSlots = (config: MockRequest): AdminSlotListResult => {
  const state = findLocale(config.params?.locale ?? "zh-cn");
  const counts = countDoc(state.docs);
  const chapterKeys = new Set(state.docs.map((doc) => doc.chapterKey).filter(Boolean));
  const summary: AdminSlotSummary = {
    sectionCount: new Set(state.docs.map((doc) => doc.sectionKey)).size,
    chapterCount: chapterKeys.size,
    ...counts,
    orphanCount: state.orphans.length
  };
  return {
    locale: state.locale,
    title: state.title,
    manifestExists: state.manifestExists,
    manifestPath: `data/help/${state.locale}/help.manifest.json`,
    tree: state.manifestExists ? buildTree(state.docs) : [],
    orphans: state.manifestExists ? state.orphans : [],
    summary,
    index: buildIndex(state)
  };
};

/** GET /v1/help/admin/slots/file-options */
export const mockAdminFileOptions = (config: MockRequest): AdminFileOptionsResult => {
  const state = findLocale(config.params?.locale ?? "zh-cn");
  const keyword = (config.params?.keyword ?? "").toLowerCase();
  const contentType = config.params?.contentType as HelpFileType | undefined;
  const page = Math.max(1, Number(config.params?.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(config.params?.pageSize ?? 20)));

  const options: AdminFileOption[] = state.docs
    .filter((doc) => (contentType ? doc.contentType === contentType : true))
    .filter((doc) => (keyword ? `${doc.file}${doc.title}`.toLowerCase().includes(keyword) : true))
    .map((doc) => ({
      file: doc.file,
      contentType: doc.contentType,
      size: doc.size,
      mtime: doc.fileUpdatedAt ?? T1,
      title: doc.title,
      used: true,
      docKey: doc.key
    }));

  state.orphans.forEach((orphan) => {
    if (contentType && orphan.contentType !== contentType) return;
    if (keyword && !`${orphan.file}${orphan.title}`.toLowerCase().includes(keyword)) return;
    options.push({
      file: orphan.file,
      contentType: orphan.contentType,
      size: orphan.size,
      mtime: orphan.mtime,
      title: orphan.title,
      used: false,
      docKey: null
    });
  });

  const start = (page - 1) * pageSize;
  return { locale: state.locale, list: options.slice(start, start + pageSize), total: options.length, page, pageSize };
};

/** POST /v1/help/admin/slots */
export const mockAdminSlotCreate = (config: MockRequest): AdminDocDetail => {
  const body = parseBody<AdminSlotCreateBody>(config);
  const state = findLocale(body.locale ?? config.params?.locale ?? "zh-cn");
  if (!body.key || !/^[a-z0-9][a-z0-9._-]{0,79}$/.test(body.key)) throw mockError(30014, "HELP_MANIFEST_INVALID");
  if (!body.sectionKey) throw mockError(30014, "HELP_MANIFEST_INVALID");
  if (!body.file || !/^(?!\/)(?!.*\.\.)(?!.*\\)/.test(body.file)) throw mockError(30013, "HELP_PATH_INVALID");
  if (state.docs.some((doc) => doc.key === body.key)) throw mockError(30012, "HELP_DOC_CONFLICT");
  if (state.docs.some((doc) => doc.file === body.file)) throw mockError(30012, "HELP_DOC_CONFLICT");

  const suffix = body.file.split(".").pop()?.toLowerCase();
  if ((body.contentType === "md" && suffix !== "md") || (body.contentType === "pdf" && suffix !== "pdf")) {
    throw mockError(30013, "HELP_PATH_INVALID");
  }

  const existingSection = state.docs.find((doc) => doc.sectionKey === body.sectionKey);
  if (existingSection && body.chapterKey) {
    const sameSection = state.docs.filter((doc) => doc.sectionKey === body.sectionKey);
    if (sameSection.some((doc) => !doc.chapterKey)) throw mockError(30014, "HELP_MANIFEST_INVALID");
  }
  const sectionTitle = existingSection?.sectionTitle ?? body.sectionTitle ?? "";
  if (!sectionTitle) throw mockError(30014, "HELP_MANIFEST_INVALID");

  const existingChapter = body.chapterKey
    ? state.docs.find((doc) => doc.sectionKey === body.sectionKey && doc.chapterKey === body.chapterKey)
    : undefined;
  const chapterTitle = existingChapter?.chapterTitle ?? body.chapterTitle ?? "";

  const doc = docOf({
    key: body.key,
    title: body.title,
    summary: body.summary,
    file: body.file,
    contentType: body.contentType,
    section: {
      key: body.sectionKey,
      title: sectionTitle,
      sort: existingSection?.sectionSort ?? body.sectionSort ?? 10,
      source: existingSection?.sectionSource ?? body.sectionSource ?? "custom"
    },
    chapter: body.chapterKey ? { key: body.chapterKey, title: chapterTitle, sort: body.chapterSort ?? 1 } : undefined,
    sort: body.sort ?? state.docs.filter((doc) => doc.sectionKey === body.sectionKey).length + 1
  });
  if (body.path) doc.path = body.path;
  state.docs.push(doc);
  return toDetail(doc);
};

/** PUT /v1/help/admin/slots/:docKey */
export const mockAdminSlotUpdate = (config: MockRequest): AdminDocDetail => {
  const { doc } = findDoc(config.params?.locale ?? "zh-cn", config.params?.docKey ?? "");
  const body = parseBody<AdminSlotUpdateBody>(config);
  if (body.title !== undefined) {
    if (!body.title) throw mockError(30014, "HELP_MANIFEST_INVALID");
    doc.title = body.title;
  }
  if (body.summary !== undefined) doc.summary = body.summary;
  if (body.sort !== undefined) doc.sort = body.sort;
  if (body.path !== undefined) doc.path = body.path || pathOf(doc.file);
  return toDetail(doc);
};

/** DELETE /v1/help/admin/slots/:docKey */
export const mockAdminSlotDelete = (config: MockRequest): { docKey: string; status: "deleted"; trashedFile: string | null } => {
  const locale = config.params?.locale ?? "zh-cn";
  const docKey = config.params?.docKey ?? "";
  if (config.params?.confirm !== docKey) throw mockError(30018, "HELP_CONFIRM_REQUIRED");
  const { state, doc } = findDoc(locale, docKey);
  state.docs = state.docs.filter((item) => item.key !== docKey);
  return { docKey, status: "deleted", trashedFile: doc.size ? `.trash/2026-11-09/${docKey}-${doc.file.split("/").pop()}` : null };
};

/** GET /v1/help/admin/slots/:docKey */
export const mockAdminSlotDetail = (config: MockRequest): AdminDocDetail =>
  toDetail(findDoc(config.params?.locale ?? "zh-cn", config.params?.docKey ?? "").doc);

/** GET /v1/help/admin/slots/:docKey/content */
/** 去掉文件头部 frontmatter：content 接口只给正文 */
const stripFrontMatter = (text: string): string => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");

export const mockAdminDocContent = (config: MockRequest): AdminDocContentResult => {
  const { doc } = findDoc(config.params?.locale ?? "zh-cn", config.params?.docKey ?? "");
  if (!doc.content) throw mockError(30016, "HELP_FILE_NOT_FOUND");
  return {
    docKey: doc.key,
    contentType: doc.contentType,
    content: stripFrontMatter(doc.content),
    hash: doc.hash,
    size: doc.size,
    baseHash: doc.hash
  };
};

/** GET /v1/help/admin/slots/:docKey/file：直接给 Blob */
export const mockAdminDocFile = (config: MockRequest): Blob => {
  const { doc } = findDoc(config.params?.locale ?? "zh-cn", config.params?.docKey ?? "");
  if (!doc.content) throw mockError(30016, "HELP_FILE_NOT_FOUND");
  if (doc.contentType === "pdf") {
    // 预览只关心能否渲染，内容用抽取文本占位
    return new Blob([`%PDF-1.4 mock ${doc.key}`], { type: "application/pdf" });
  }
  return new Blob([`---\ntitle: ${doc.title}\n---\n\n${doc.content}`], { type: "text/markdown" });
};

/** PUT /v1/help/admin/slots/:docKey/content：multipart */
export const mockAdminDocSave = async (config: MockRequest): Promise<AdminDocSaveResult> => {
  const { doc } = findDoc(config.params?.locale ?? "zh-cn", config.params?.docKey ?? "");
  const form = config.data as FormData | undefined;
  const file = form?.get("file");
  if (!(file instanceof File)) throw mockError(30013, "HELP_PATH_INVALID");
  // 与后端 help.config 一致：Markdown 2MB，PDF 20MB
  const limit = doc.contentType === "md" ? 2 * 1024 * 1024 : 20 * 1024 * 1024;
  if (file.size > limit) throw mockError(70002, "FILE_TOO_LARGE");
  const baseHash = form?.get("baseHash");
  if (typeof baseHash === "string" && baseHash && baseHash !== doc.hash) throw mockError(30012, "HELP_DOC_CONFLICT");

  const text = await file.text();
  // 正文与文件头部分开存，避免重复保存把 frontmatter 叠起来
  doc.content = stripFrontMatter(text);
  doc.hash = `mock-hash-${Date.now()}`;
  doc.size = text.length;
  doc.status = "published";
  doc.fileUpdatedAt = new Date().toISOString();
  doc.indexedAt = new Date().toISOString();
  return { docKey: doc.key, status: "published", path: doc.path, hash: doc.hash, size: doc.size, indexedAt: doc.indexedAt };
};

/** DELETE /v1/help/admin/slots/:docKey/content */
export const mockAdminDocClear = (config: MockRequest): { docKey: string; status: "empty"; trashedFile: string | null } => {
  const docKey = config.params?.docKey ?? "";
  if (config.params?.confirm !== docKey) throw mockError(30018, "HELP_CONFIRM_REQUIRED");
  const { doc } = findDoc(config.params?.locale ?? "zh-cn", docKey);
  const trashed = doc.size ? `.trash/2026-11-09/${docKey}-${doc.file.split("/").pop()}` : null;
  doc.content = "";
  doc.size = 0;
  doc.status = "empty";
  doc.indexedAt = null;
  doc.fileUpdatedAt = null;
  doc.hash = hashOf(doc.key);
  return { docKey, status: "empty", trashedFile: trashed };
};

/** POST /v1/help/admin/assets */
export const mockAdminAsset = async (config: MockRequest): Promise<{ url: string; path: string; size: number; mimeType: string }> => {
  const form = config.data as FormData | undefined;
  const file = form?.get("file");
  if (!(file instanceof File)) throw mockError(30005, "FILE_TYPE_NOT_ALLOWED");
  if (!/image\/(png|jpeg|webp|gif)/.test(file.type)) throw mockError(30005, "FILE_TYPE_NOT_ALLOWED");
  if (file.size > 5 * 1024 * 1024) throw mockError(70002, "FILE_TOO_LARGE");
  const suffix = file.name.split(".").pop() ?? "png";
  const name = `mock-${Date.now()}.${suffix}`;
  return { url: `/api/v1/help/assets/${name}`, path: `assets/${name}`, size: file.size, mimeType: file.type };
};

/** POST /v1/help/admin/reindex */
export const mockAdminReindex = async (): Promise<AdminReindexResult> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  let count = 0;
  let skipped = 0;
  adminLocales.forEach((state) => {
    if (!state.manifestExists) {
      skipped += 1;
      return;
    }
    state.docs.forEach((doc) => {
      if (!doc.content) return;
      doc.status = "published";
      doc.indexedAt = new Date().toISOString();
      count += 1;
    });
  });
  return { count, localeCount: adminLocales.length, skipped };
};

/** GET /v1/help/admin/index/status */
export const mockAdminIndexStatus = (config: MockRequest): AdminIndexStatusResult => {
  const target = config.params?.locale;
  const states = target ? [findLocale(target)] : adminLocales;
  const locales = states.map(buildIndex);
  return {
    locales,
    summary: {
      localeCount: locales.length,
      docCount: locales.reduce((sum, item) => sum + item.docCount, 0),
      indexedCount: locales.reduce((sum, item) => sum + item.indexedCount, 0),
      staleCount: locales.reduce((sum, item) => sum + item.staleCount, 0),
      orphanCount: locales.reduce((sum, item) => sum + item.orphanCount, 0),
      emptyCount: locales.reduce((sum, item) => sum + item.emptyCount, 0)
    }
  };
};

/** 同一路径按 method 分派：GET 列表、POST 新建 */
export const mockAdminSlotsRoute = (config: MockRequest & { method?: string }) =>
  config.method === "post" ? mockAdminSlotCreate(config) : mockAdminSlots(config);

/** 同一路径按 method 分派：GET 详情、PUT 改展示信息、DELETE 删槽位 */
export const mockAdminSlotItemRoute = (config: MockRequest & { method?: string }) => {
  if (config.method === "delete") return mockAdminSlotDelete(config);
  if (config.method === "put") return mockAdminSlotUpdate(config);
  return mockAdminSlotDetail(config);
};

/** 同一路径按 method 分派：GET 正文、PUT 上传、DELETE 清空 */
export const mockAdminDocRoute = (config: MockRequest & { method?: string }) => {
  if (config.method === "put") return mockAdminDocSave(config);
  if (config.method === "delete") return mockAdminDocClear(config);
  return mockAdminDocContent(config);
};
