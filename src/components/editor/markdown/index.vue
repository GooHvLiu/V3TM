<script setup lang="ts">
/**
 * Markdown 编辑器
 * Vditor 即时渲染，资源走本地 /vditor，不连外网 CDN
 */
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { TOKEN_KEY } from "@/constants";
import { storage } from "@/utils";
import type { AdminAssetResult } from "@/types/help/admin";

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    modelValue: string;
    readonly?: boolean;
    height?: number;
  }>(),
  { readonly: false, height: 460 }
);

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const host = ref<HTMLDivElement>();
let editor: Vditor | null = null;
/** Vditor 的 lute 在 after 之前才装配完成，此前调 setValue / getValue 会取不到 lute */
let ready = false;

/** 资源接口按 baseURL 拼接，开发期由 vite proxy 转发 */
const uploadUrl = `${import.meta.env.VITE_APP_BASE_API}/v1/help/admin/assets`;

/** 把 { code, msg, data } 壳转成 Vditor 认的 succMap */
const formatUpload = (files: File[], responseText: string): string => {
  try {
    const body = JSON.parse(responseText) as { code: number; msg: string; data?: AdminAssetResult };
    if (body.code !== 200 || !body.data) throw new Error(body.msg);
    const succMap: Record<string, string> = {};
    files.forEach((file) => {
      succMap[file.name] = body.data!.url;
    });
    return JSON.stringify({ code: 0, msg: "", data: { errFiles: [], succMap } });
  } catch {
    return JSON.stringify({
      code: 1,
      msg: "UPLOAD_FAILED",
      data: { errFiles: files.map((file) => file.name), succMap: {} }
    });
  }
};

onMounted(() => {
  if (!host.value) return;
  editor = new Vditor(host.value, {
    mode: "ir",
    cdn: "/vditor",
    height: props.height,
    placeholder: t("common.editorPlaceholder"),
    cache: { enable: false },
    toolbar: [
      "headings",
      "bold",
      "italic",
      "strike",
      "inline-code",
      "|",
      "list",
      "ordered-list",
      "check",
      "quote",
      "|",
      "table",
      "link",
      "upload",
      "|",
      "undo",
      "redo"
    ],
    upload: {
      url: uploadUrl,
      fieldName: "file",
      accept: "image/png,image/jpeg,image/webp,image/gif",
      // 凭证每次上传前现取，避免过期
      setHeaders: () => ({ Authorization: `Bearer ${storage.get<string>(TOKEN_KEY) ?? ""}` }),
      format: formatUpload
    },
    input: (value: string) => emit("update:modelValue", value),
    after: () => {
      ready = true;
      editor?.setValue(props.modelValue);
      if (props.readonly) editor?.disabled();
    }
  });
});

watch(
  () => props.modelValue,
  (value) => {
    if (!editor || !ready) return;
    // 只在外部换文档时回填，避免打断正在输入的内容
    if (value !== editor.getValue()) editor.setValue(value);
  }
);

watch(
  () => props.readonly,
  (value) => {
    if (!editor || !ready) return;
    if (value) editor.disabled();
    else editor.enable();
  }
);

onBeforeUnmount(() => {
  ready = false;
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="host" class="markdown-editor" />
</template>

<style scoped lang="less">
.markdown-editor {
  width: 100%;

  :deep(.vditor) {
    border-radius: @radius-base;
    border-color: @color-border;
  }

  :deep(.vditor-toolbar) {
    background: @color-bg-container;
  }
}
</style>
