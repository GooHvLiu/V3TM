<script setup lang="ts">
/**
 * 新建文档位
 * v2 契约下 section / chapter / doc 一次落地，file 创建后不可改
 */
import { computed, nextTick, reactive, ref, watch } from "vue";
import { ElMessage } from "@/utils/element-plus";
import type { FormInstance } from "element-plus";
import { useI18n } from "vue-i18n";
import { z } from "zod";
import { createSlot, fetchFileOptions } from "@/api/help/admin";
import HelpTip from "@/components/knowledge-center/help-tip/index.vue";
import { zodToRules } from "@/utils";
import type {
  AdminFileOption,
  AdminSlotCreateBody,
  AdminSlotListResult,
  AdminChapterNode,
  AdminSectionNode,
  HelpFileType
} from "@/types/help/admin";

const props = defineProps<{
  modelValue: boolean;
  locale: string;
  slots: AdminSlotListResult | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "created"): void;
}>();

const { t } = useI18n();

const form = reactive({
  sectionMode: "existing" as "existing" | "new",
  sectionKey: "",
  sectionTitle: "",
  sectionSort: 10,
  chapterMode: "none" as "none" | "existing" | "new",
  chapterKey: "",
  chapterTitle: "",
  chapterSort: 1,
  key: "",
  title: "",
  summary: "",
  sort: 1,
  file: "",
  contentType: "md" as HelpFileType,
  path: ""
});

const submitting = ref(false);
const fileOptions = ref<AdminFileOption[]>([]);
const formRef = ref<FormInstance>();

/** 文档位 key：小写字母数字开头，允许点、下划线、连字符 */
const SLOT_KEY = /^[a-z0-9][a-z0-9._-]{0,79}$/;

const rules = computed(() =>
  zodToRules(
    z
      .object({
        sectionKey: z.string().trim(),
        sectionTitle: z.string().trim(),
        chapterKey: z.string().trim(),
        chapterTitle: z.string().trim(),
        key: z.string().trim(),
        title: z.string().trim(),
        file: z.string().trim()
      })
      .superRefine((data, ctx) => {
        if (!data.sectionKey) {
          ctx.addIssue({ code: "custom", path: ["sectionKey"], message: "knowledgeCenter.message.sectionRequired" });
        }
        if (form.sectionMode === "new" && !data.sectionTitle) {
          ctx.addIssue({ code: "custom", path: ["sectionTitle"], message: "knowledgeCenter.message.sectionRequired" });
        }
        if (!SLOT_KEY.test(data.key)) {
          ctx.addIssue({ code: "custom", path: ["key"], message: "knowledgeCenter.message.invalidKey" });
        }
        if (!data.title) {
          ctx.addIssue({ code: "custom", path: ["title"], message: "knowledgeCenter.message.titleRequired" });
        }
        if (!data.file) {
          ctx.addIssue({ code: "custom", path: ["file"], message: "knowledgeCenter.message.fileRequired" });
        }
        if (form.chapterMode === "new") {
          if (!data.chapterKey) {
            ctx.addIssue({ code: "custom", path: ["chapterKey"], message: "knowledgeCenter.create.chapterTitle" });
          }
          if (!data.chapterTitle) {
            ctx.addIssue({ code: "custom", path: ["chapterTitle"], message: "knowledgeCenter.create.chapterTitle" });
          }
        }
      }),
    t,
    () => form
  )
);

const sections = computed<AdminSectionNode[]>(() => props.slots?.tree ?? []);

/** 文件名提示按候选情况分三种口径：没有候选、全部占用、正常 */
const fileTip = computed(() => {
  if (!fileOptions.value.length) return "knowledgeCenter.create.fileEmpty";
  if (fileOptions.value.every((item) => item.used)) return "knowledgeCenter.create.fileAllUsed";
  return "knowledgeCenter.create.fileTip";
});

/** 当前版块下已有的章节，供复用 */
const chapters = computed<AdminChapterNode[]>(() => {
  const section = sections.value.find((item) => item.key === form.sectionKey);
  if (!section) return [];
  return section.children.filter((item): item is AdminChapterNode => item.type === "chapter");
});

/** 版块下是否已有直挂文档：有则不能再建章节，后端会按混排拒绝 */
const sectionHasDirectDoc = computed(() => {
  const section = sections.value.find((item) => item.key === form.sectionKey);
  return Boolean(section?.children.some((item) => item.type === "doc"));
});

const reset = () => {
  form.sectionMode = sections.value.length ? "existing" : "new";
  form.sectionKey = sections.value[0]?.key ?? "";
  form.sectionTitle = "";
  form.sectionSort = 10;
  form.chapterMode = "none";
  form.chapterKey = "";
  form.chapterTitle = "";
  form.chapterSort = 1;
  form.key = "";
  form.title = "";
  form.summary = "";
  form.sort = 1;
  form.file = "";
  form.contentType = "md";
  form.path = "";
};

const loadFileOptions = async () => {
  if (!props.locale) return;
  const result = await fetchFileOptions({ locale: props.locale, pageSize: 100 });
  fileOptions.value = result.list;
};

watch(
  () => props.modelValue,
  (visible) => {
    if (!visible) return;
    reset();
    void nextTick(() => formRef.value?.clearValidate());
    void loadFileOptions();
  },
  { immediate: true }
);

watch(
  () => form.sectionKey,
  () => {
    form.chapterMode = "none";
    form.chapterKey = "";
  }
);

/** 按扩展名定类型，避免和 manifest 的 contentType 冲突 */
watch(
  () => form.file,
  (file) => {
    const suffix = file.split(".").pop()?.toLowerCase();
    if (suffix === "md") form.contentType = "md";
    if (suffix === "pdf") form.contentType = "pdf";
  }
);

const pickCandidate = (file: string) => {
  const target = fileOptions.value.find((item) => item.file === file);
  if (target) form.contentType = target.contentType;
};

const submit = async () => {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  const body: AdminSlotCreateBody = {
    locale: props.locale,
    sectionKey: form.sectionKey,
    key: form.key,
    title: form.title,
    file: form.file,
    contentType: form.contentType,
    sort: form.sort,
    summary: form.summary || undefined,
    path: form.path || undefined
  };
  if (form.sectionMode === "new") {
    body.sectionTitle = form.sectionTitle;
    body.sectionSort = form.sectionSort;
    body.sectionSource = "custom";
  }
  if (form.chapterMode === "existing" && form.chapterKey) {
    body.chapterKey = form.chapterKey;
  }
  if (form.chapterMode === "new") {
    body.chapterKey = form.chapterKey;
    body.chapterTitle = form.chapterTitle;
    body.chapterSort = form.chapterSort;
  }

  submitting.value = true;
  try {
    await createSlot(body);
    ElMessage.success(t("knowledgeCenter.create.success"));
    emit("created");
    emit("update:modelValue", false);
  } finally {
    submitting.value = false;
  }
};

</script>

<template>
  <app-dialog
    :model-value="modelValue"
    :title="t('knowledgeCenter.create.title')"
    width="620px"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="112px" label-position="right">
      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.section") }}
            <HelpTip :text="t('knowledgeCenter.help.section')" />
          </span>
        </template>
        <el-radio-group v-model="form.sectionMode">
          <el-radio value="existing" :disabled="!sections.length">
            {{ t("knowledgeCenter.create.section") }}
          </el-radio>
          <el-radio value="new">{{ t("knowledgeCenter.create.sectionNew") }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="form.sectionMode === 'existing'">
        <el-form-item prop="sectionKey">
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.sectionKey") }}
              <HelpTip :text="t('knowledgeCenter.help.sectionKey')" />
            </span>
          </template>
          <el-select v-model="form.sectionKey" filterable style="width: 100%">
            <el-option v-for="item in sections" :key="item.key" :label="item.title" :value="item.key" />
          </el-select>
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item prop="sectionKey">
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.sectionKey") }}
              <HelpTip :text="t('knowledgeCenter.help.sectionKey')" />
            </span>
          </template>
          <el-input v-model="form.sectionKey" placeholder="quick-start" />
        </el-form-item>
        <el-form-item prop="sectionTitle">
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.sectionTitle") }}
              <HelpTip :text="t('knowledgeCenter.help.sectionTitle')" />
            </span>
          </template>
          <el-input v-model="form.sectionTitle" :placeholder="t('knowledgeCenter.create.exampleSectionTitle')" />
        </el-form-item>
        <el-form-item>
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.sectionSort") }}
              <HelpTip :text="t('knowledgeCenter.help.sectionSort')" />
            </span>
          </template>
          <el-input-number v-model="form.sectionSort" :min="0" :max="9999" />
        </el-form-item>
      </template>

      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.chapterMode") }}
            <HelpTip :text="t('knowledgeCenter.help.chapter')" />
          </span>
        </template>
        <el-radio-group v-model="form.chapterMode">
          <el-radio value="none">{{ t("knowledgeCenter.create.chapterNone") }}</el-radio>
          <el-radio value="existing" :disabled="!chapters.length">
            {{ t("knowledgeCenter.create.chapterMode") }}
          </el-radio>
          <el-radio value="new" :disabled="sectionHasDirectDoc">
            {{ t("knowledgeCenter.create.chapterNew") }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="form.chapterMode === 'existing'">
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.chapterKey") }}
            <HelpTip :text="t('knowledgeCenter.help.chapterKey')" />
          </span>
        </template>
        <el-select v-model="form.chapterKey" filterable style="width: 100%">
          <el-option v-for="item in chapters" :key="item.key" :label="item.title" :value="item.key" />
        </el-select>
      </el-form-item>

      <template v-if="form.chapterMode === 'new'">
        <el-form-item prop="chapterKey">
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.chapterKey") }}
              <HelpTip :text="t('knowledgeCenter.help.chapterKey')" />
            </span>
          </template>
          <el-input v-model="form.chapterKey" placeholder="getting-started" />
        </el-form-item>
        <el-form-item prop="chapterTitle">
          <template #label>
            <span class="item-label">
              {{ t("knowledgeCenter.create.chapterTitle") }}
              <HelpTip :text="t('knowledgeCenter.help.chapterTitle')" />
            </span>
          </template>
          <el-input v-model="form.chapterTitle" :placeholder="t('knowledgeCenter.create.exampleChapterTitle')" />
        </el-form-item>
      </template>

      <app-separator />

      <el-form-item prop="key">
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.key") }}
            <HelpTip :text="t('knowledgeCenter.help.key')" />
          </span>
        </template>
        <el-input v-model="form.key" placeholder="system-introduction" />
        <div class="field-tip">{{ t("knowledgeCenter.create.keyTip") }}</div>
      </el-form-item>

      <el-form-item prop="title">
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.titleLabel") }}
            <HelpTip :text="t('knowledgeCenter.help.title')" />
          </span>
        </template>
        <el-input v-model="form.title" :placeholder="t('knowledgeCenter.create.exampleTitle')" />
      </el-form-item>

      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.summary") }}
            <HelpTip :text="t('knowledgeCenter.help.summary')" />
          </span>
        </template>
        <el-input v-model="form.summary" type="textarea" :rows="2" maxlength="300" show-word-limit />
      </el-form-item>

      <el-form-item prop="file">
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.file") }}
            <HelpTip :text="t('knowledgeCenter.help.file')" />
          </span>
        </template>
        <el-select
          v-model="form.file"
          filterable
          allow-create
          default-first-option
          style="width: 100%"
          :placeholder="t('knowledgeCenter.create.exampleFile')"
          @change="pickCandidate"
        >
          <el-option
            v-for="item in fileOptions"
            :key="item.file"
            :label="item.file"
            :value="item.file"
            :disabled="item.used"
          >
            <span class="option-file">{{ item.file }}</span>
            <span v-if="item.used" class="option-note">{{ t("knowledgeCenter.create.fileUsed") }}</span>
          </el-option>
        </el-select>
        <div class="field-tip">{{ t(fileTip) }}</div>
      </el-form-item>

      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.contentType") }}
            <HelpTip :text="t('knowledgeCenter.help.contentType')" />
          </span>
        </template>
        <el-radio-group v-model="form.contentType">
          <el-radio value="md">Markdown</el-radio>
          <el-radio value="pdf">PDF</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.sort") }}
            <HelpTip :text="t('knowledgeCenter.help.sort')" />
          </span>
        </template>
        <el-input-number v-model="form.sort" :min="0" :max="9999" />
      </el-form-item>

      <el-form-item>
        <template #label>
          <span class="item-label">
            {{ t("knowledgeCenter.create.path") }}
            <HelpTip :text="t('knowledgeCenter.help.path')" />
          </span>
        </template>
        <el-input v-model="form.path" :placeholder="t('knowledgeCenter.create.examplePath')" />
        <div class="field-tip">{{ t("knowledgeCenter.create.pathTip") }}</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <app-button variant="outline" @click="emit('update:modelValue', false)">{{ t("common.cancel") }}</app-button>
      <app-button tone="primary" :loading="submitting" @click="submit">
        {{ t("common.confirm") }}
      </app-button>
    </template>
  </app-dialog>
</template>

<style scoped lang="less">
.item-label {
  display: inline-flex;
  align-items: center;
}

.field-tip {
  margin-top: @space-1;
  font-size: 12px;
  line-height: 1.5;
  color: @color-text-secondary;
}

.option-file {
  margin-right: @space-2;
}

.option-note {
  float: right;
  margin-left: @space-3;
  font-size: 12px;
  color: @color-text-placeholder;
}
</style>
