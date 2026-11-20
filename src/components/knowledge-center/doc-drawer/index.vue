<script setup lang="ts">
/**
 * 文档详情抽屉
 * Markdown 可编辑；PDF 只做预览。md 保存时把原文 frontmatter 拼回去，
 * 避免 GET content 返回的正文覆盖掉文件头部的元信息。
 */
import { computed, nextTick, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "@/utils/element-plus";
import { zodToRules } from "@/utils";
import { z } from "zod";
import type { FormInstance, UploadFile } from "element-plus";
import { useI18n } from "vue-i18n";
import MarkdownEditor from "@/components/editor/markdown/index.vue";
import {
  clearDocContent,
  fetchDocContent,
  fetchDocFile,
  fetchSlotDetail,
  removeSlot,
  saveDocContent,
  updateSlot
} from "@/api/help/admin";
import type { AdminDocDetail } from "@/types/help/admin";
import { useConfigStore } from "@/stores/modules/config";
import { DOC_STATUS, formatSize, formatTime } from "@/pages/super-admin/knowledge-center/status";

const props = defineProps<{
  modelValue: boolean;
  locale: string;
  docKey: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "refresh"): void;
}>();

const { t } = useI18n();
const configStore = useConfigStore();

/** 上传上限取系统参数，配置未就绪时按 2MB 兜底 */
const uploadMaxMB = computed<number>(() => Number(configStore.getValue("upload_max_size_mb")) || 10);

/** 抽屉宽度；右沿贴边，拖动左沿即可调整 */
const drawerWidth = ref(780);
const MIN_DRAWER_WIDTH = 520;

/** 宽度上限：留出 64px 给页面留白；窗口变化时随取随算 */
const drawerMaxWidth = computed<number>(() => Math.max(MIN_DRAWER_WIDTH, window.innerWidth - 64));

/** 键盘调整宽度：左沿左移变宽，方向键按 24px 一档 */
const nudgeWidth = (delta: number): void => {
  drawerWidth.value = Math.min(drawerMaxWidth.value, Math.max(MIN_DRAWER_WIDTH, drawerWidth.value + delta));
};

const startResize = (event: MouseEvent) => {
  event.preventDefault();
  const max = Math.max(MIN_DRAWER_WIDTH, window.innerWidth - 64);
  const prevSelect = document.body.style.userSelect;
  const prevCursor = document.body.style.cursor;
  document.body.style.userSelect = "none";
  document.body.style.cursor = "col-resize";

  const move = (e: MouseEvent) => {
    drawerWidth.value = Math.min(max, Math.max(MIN_DRAWER_WIDTH, window.innerWidth - e.clientX));
  };
  const stop = () => {
    document.body.style.userSelect = prevSelect;
    document.body.style.cursor = prevCursor;
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", stop);
  };

  window.addEventListener("mousemove", move);
  window.addEventListener("mouseup", stop);
};

const detail = ref<AdminDocDetail | null>(null);
const loading = ref(false);
const saving = ref(false);
const metaSaving = ref(false);
const content = ref("");
const originalContent = ref("");
const frontmatter = ref("");
const pdfUrl = ref("");

const meta = reactive({ title: "", summary: "", sort: 0, path: "" });
const metaVisible = ref(false);
const metaFormRef = ref<FormInstance>();

const metaRules = computed(() =>
  zodToRules(
    z.object({
      title: z.string().trim().min(1, { message: "knowledgeCenter.message.titleRequired" }),
      sort: z.number().int().min(0)
    }),
    t
  )
);

const statusMeta = computed(() => (detail.value ? DOC_STATUS[detail.value.status] : DOC_STATUS.empty));
const isPdf = computed(() => detail.value?.contentType === "pdf");
const isDirty = computed(() => detail.value?.contentType === "md" && content.value !== originalContent.value);
const uploadAccept = computed(() => (isPdf.value ? ".pdf" : ".md"));

/** 取原文头部的 frontmatter 段，保存时原样拼回 */
const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;

const clearPdfUrl = () => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = "";
};

/** 连点不同文档时，只认最后一次请求的结果 */
let loadToken = 0;

const load = async () => {
  if (!props.docKey || !props.locale) return;
  const token = ++loadToken;
  loading.value = true;
  clearPdfUrl();
  content.value = "";
  originalContent.value = "";
  frontmatter.value = "";
  try {
    const info = await fetchSlotDetail(props.locale, props.docKey);
    if (token !== loadToken) return;
    detail.value = info;
    meta.title = info.title;
    meta.summary = info.summary;
    meta.sort = info.sort;
    meta.path = info.path;

    if (info.status === "empty") return;
    const raw = await fetchDocFile(props.locale, props.docKey);
    if (token !== loadToken) return;
    if (info.contentType === "pdf") {
      pdfUrl.value = URL.createObjectURL(new Blob([raw], { type: "application/pdf" }));
      return;
    }
    frontmatter.value = FRONT_MATTER.exec(await raw.text())?.[0] ?? "";
    if (token !== loadToken) return;
    const text = await fetchDocContent(props.locale, props.docKey);
    if (token !== loadToken) return;
    content.value = text.content;
    originalContent.value = text.content;
  } catch {
    if (token === loadToken) detail.value = null;
  } finally {
    if (token === loadToken) loading.value = false;
  }
};

watch(
  () => (props.modelValue ? `${props.locale}/${props.docKey}` : ""),
  (target) => {
    if (target) void nextTick(load);
  },
  { immediate: true }
);

/** 统一的上传入口：空位首传、已有文件替换都走这里 */
const persist = async (raw: File) => {
  if (!detail.value) return;
  const limit = uploadMaxMB.value * 1024 * 1024;
  if (raw.size > limit) return ElMessage.error(t("knowledgeCenter.message.fileTooLarge", { max: uploadMaxMB.value }));
  const suffix = raw.name.split(".").pop()?.toLowerCase();
  if (
    (detail.value.contentType === "md" && suffix !== "md") ||
    (detail.value.contentType === "pdf" && suffix !== "pdf")
  ) {
    return ElMessage.error(t("knowledgeCenter.message.fileTypeInvalid"));
  }

  saving.value = true;
  try {
    const result = await saveDocContent(
      props.locale,
      props.docKey,
      raw,
      detail.value.status === "empty" ? undefined : detail.value.hash
    );
    detail.value = {
      ...detail.value,
      status: result.status,
      hash: result.hash,
      size: result.size,
      indexedAt: result.indexedAt,
      fileUpdatedAt: new Date().toISOString()
    };
    originalContent.value = content.value;
    ElMessage.success(t("knowledgeCenter.detail.saved"));
    emit("refresh");
  } catch (error) {
    // 冲突已在拦截器提示，这里只负责把内容拉回最新
    if ((error as { code?: number }).code === 30012) await load();
  } finally {
    saving.value = false;
  }
};

/** 编辑器保存：把 frontmatter 拼回文件头部 */
const saveContent = async () => {
  if (!detail.value) return;
  const name = detail.value.file.split("/").pop() ?? `${detail.value.key}.md`;
  await persist(new File([`${frontmatter.value}${content.value}`], name, { type: "text/markdown" }));
};

const handleUpload = async (file: UploadFile) => {
  if (!file.raw) return;
  await persist(file.raw);
};

const saveMeta = async () => {
  if (!detail.value) return;
  try {
    await metaFormRef.value?.validate();
  } catch {
    return;
  }
  metaSaving.value = true;
  try {
    const updated = await updateSlot(props.locale, props.docKey, {
      title: meta.title,
      summary: meta.summary,
      sort: meta.sort,
      path: meta.path
    });
    detail.value = updated;
    ElMessage.success(t("knowledgeCenter.detail.saved"));
    emit("refresh");
  } finally {
    metaSaving.value = false;
  }
};

const clear = async () => {
  if (!detail.value) return;
  try {
    await ElMessageBox.confirm(t("knowledgeCenter.message.confirmClear"), t("knowledgeCenter.detail.title"), {
      type: "warning"
    });
  } catch {
    return;
  }
  await clearDocContent(props.locale, props.docKey);
  ElMessage.success(t("knowledgeCenter.message.cleared"));
  emit("refresh");
  await load();
};

const remove = async () => {
  if (!detail.value) return;
  try {
    await ElMessageBox.confirm(t("knowledgeCenter.message.confirmDelete"), t("knowledgeCenter.detail.title"), {
      type: "warning"
    });
  } catch {
    return;
  }
  await removeSlot(props.locale, props.docKey);
  ElMessage.success(t("knowledgeCenter.message.deleted"));
  emit("refresh");
  emit("update:modelValue", false);
};

const beforeClose = async (done: () => void) => {
  if (!isDirty.value) {
    done();
    return;
  }
  try {
    await ElMessageBox.confirm(t("knowledgeCenter.detail.unsaved"), t("knowledgeCenter.detail.title"), {
      type: "warning"
    });
    done();
  } catch {
    // 留在抽屉继续编辑
  }
};
</script>

<template>
  <app-drawer
    :model-value="modelValue"
    :size="drawerWidth + 'px'"
    :with-header="false"
    destroy-on-close
    :before-close="beforeClose"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-loading="loading" class="doc-drawer">
      <div
        class="drawer-resizer"
        role="slider"
        tabindex="0"
        aria-orientation="vertical"
        :aria-valuenow="drawerWidth"
        :aria-valuemin="MIN_DRAWER_WIDTH"
        :aria-valuemax="drawerMaxWidth"
        :aria-label="t('knowledgeCenter.detail.resize')"
        @mousedown="startResize"
        @keydown.left.prevent="nudgeWidth(24)"
        @keydown.right.prevent="nudgeWidth(-24)"
      />
      <header class="drawer-head">
        <div class="head-main">
          <div class="head-title">{{ detail?.title || t("knowledgeCenter.detail.title") }}</div>
          <div class="head-sub">{{ detail?.path || detail?.file || "" }}</div>
        </div>
        <div class="head-side">
          <app-tag :type="statusMeta.tone" effect="light">{{ t(statusMeta.labelKey) }}</app-tag>
          <app-button variant="ghost" @click="emit('update:modelValue', false)">
            {{ t("knowledgeCenter.action.close") }}
          </app-button>
        </div>
      </header>

      <template v-if="detail">
        <section class="meta-block">
          <app-button variant="link" tone="primary" @click="metaVisible = !metaVisible">
            {{ t("knowledgeCenter.detail.metaTitle") }}
          </app-button>
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">{{ t("knowledgeCenter.detail.key") }}</span>
              <span class="meta-value">{{ detail.key }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ t("knowledgeCenter.detail.section") }}</span>
              <span class="meta-value">{{ detail.section.title }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ t("knowledgeCenter.detail.chapter") }}</span>
              <span class="meta-value">{{ detail.chapter?.title || t("knowledgeCenter.detail.none") }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ t("knowledgeCenter.detail.size") }}</span>
              <span class="meta-value">{{ formatSize(detail.size) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">{{ t("knowledgeCenter.detail.indexedAt") }}</span>
              <span class="meta-value">{{ formatTime(detail.indexedAt) || t("knowledgeCenter.detail.none") }}</span>
            </div>
          </div>

          <el-form v-if="metaVisible" ref="metaFormRef" :model="meta" :rules="metaRules" label-width="84px" class="meta-form">
            <el-form-item :label="t('knowledgeCenter.create.titleLabel')" prop="title">
              <el-input v-model="meta.title" maxlength="120" />
            </el-form-item>
            <el-form-item :label="t('knowledgeCenter.create.summary')">
              <el-input v-model="meta.summary" type="textarea" :rows="2" maxlength="300" show-word-limit />
            </el-form-item>
            <el-form-item :label="t('knowledgeCenter.create.sort')" prop="sort">
              <el-input-number v-model="meta.sort" :min="0" :max="9999" />
            </el-form-item>
            <el-form-item :label="t('knowledgeCenter.detail.path')">
              <el-input v-model="meta.path" :placeholder="detail.path" />
            </el-form-item>
            <el-form-item>
              <app-button tone="primary" :loading="metaSaving" @click="saveMeta">
                {{ t("knowledgeCenter.action.save") }}
              </app-button>
            </el-form-item>
          </el-form>
        </section>

        <section class="body-block">
          <template v-if="detail.status === 'empty'">
            <div class="empty-tip">{{ t("knowledgeCenter.detail.emptyContent") }}</div>
            <el-upload :auto-upload="false" :show-file-list="false" :accept="uploadAccept" :on-change="handleUpload">
              <app-button v-permission="'superAdmin:help:doc:create'" tone="primary" :loading="saving">
                {{ t("knowledgeCenter.action.save") }}
              </app-button>
            </el-upload>
          </template>

          <template v-else-if="isPdf">
            <div class="pdf-tip">{{ t("knowledgeCenter.detail.pdfTip") }}</div>
            <iframe v-if="pdfUrl" class="pdf-frame" :src="pdfUrl" :title="detail.title" />
            <el-upload :auto-upload="false" :show-file-list="false" accept=".pdf" :on-change="handleUpload">
              <app-button v-permission="'superAdmin:help:doc:update'" :loading="saving" variant="outline">
                {{ t("knowledgeCenter.action.save") }}
              </app-button>
            </el-upload>
          </template>

          <template v-else>
            <MarkdownEditor v-model="content" :height="520" />
            <div class="body-tip">{{ t("knowledgeCenter.detail.frontmatterTip") }}</div>
          </template>
        </section>

        <footer class="drawer-foot">
          <div class="foot-left">
            <app-button v-if="detail.status !== 'empty'" v-permission="'superAdmin:help:doc:delete'" variant="outline" @click="clear">
              {{ t("knowledgeCenter.action.clear") }}
            </app-button>
            <app-button v-permission="'superAdmin:help:slot:manage'" tone="danger" variant="outline" @click="remove">
              {{ t("knowledgeCenter.action.remove") }}
            </app-button>
          </div>
          <div class="foot-right">
            <span v-if="isDirty" class="dirty-tip">{{ t("knowledgeCenter.detail.unsaved") }}</span>
            <app-button
              v-if="!isPdf && detail.status !== 'empty'"
              v-permission="'superAdmin:help:doc:update'"
              tone="primary"
              :loading="saving"
              :disabled="!isDirty"
              @click="saveContent"
            >
              {{ t("knowledgeCenter.action.save") }}
            </app-button>
            <el-upload
              v-if="detail.status !== 'empty'"
              :auto-upload="false"
              :show-file-list="false"
              :accept="uploadAccept"
              :on-change="handleUpload"
            >
              <app-button v-permission="'superAdmin:help:doc:update'" :loading="saving" variant="outline">
                {{ t("knowledgeCenter.action.save") }}
              </app-button>
            </el-upload>
          </div>
        </footer>
      </template>
    </div>
  </app-drawer>
</template>

<style scoped lang="less">
.doc-drawer {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: @space-4;
  min-height: 100%;
  padding-left: @space-2-5;
}

.drawer-resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 10px;
  cursor: col-resize;
  border-radius: @radius-sm;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 4px;
    width: 2px;
    height: 40px;
    margin-top: -20px;
    border-radius: 1px;
    background: @color-border-deep;
    transition: background-color 0.2s;
  }

  &:hover {
    background: @color-bg-hover;

    &::after {
      background: @color-primary;
    }
  }
}

.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: @space-3;
  padding-bottom: @space-3;
  border-bottom: 1px solid @color-border-light;
}

.head-main {
  min-width: 0;
}

.head-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  color: @color-text-primary;
}

.head-sub {
  margin-top: @space-1;
  font-size: 12px;
  word-break: break-all;
  color: @color-text-secondary;
}

.head-side {
  display: flex;
  align-items: center;
  gap: @space-2;
  flex-shrink: 0;
}

.meta-block {
  padding: @space-3;
  border: 1px solid @color-border-lighter;
  border-radius: @radius-base;
  background: @color-bg-container;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: @space-2 @space-6;
  margin-top: @space-2;
}

.meta-item {
  display: flex;
  gap: @space-2;
  font-size: 13px;
  min-width: 0;
}

.meta-label {
  flex-shrink: 0;
  color: @color-text-secondary;
}

.meta-value {
  word-break: break-all;
  color: @color-text-primary;
}

.meta-form {
  margin-top: @space-3;
}

.body-block {
  display: flex;
  flex-direction: column;
  gap: @space-2;
}

.empty-tip,
.pdf-tip,
.body-tip {
  font-size: 12px;
  line-height: 1.6;
  color: @color-text-secondary;
}

.pdf-frame {
  width: 100%;
  height: 560px;
  border: 1px solid @color-border-light;
  border-radius: @radius-base;
}

.drawer-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: @space-3;
  padding-top: @space-3;
  border-top: 1px solid @color-border-light;
}

.foot-left,
.foot-right {
  display: flex;
  align-items: center;
  gap: @space-2;
}

.dirty-tip {
  font-size: 12px;
  color: @color-warning;
}
</style>
