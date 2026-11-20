<template>
  <BasicPage :title="t('help.title')">
    <template #content>
      <!-- 模式未取回：加载态过渡（未知模式，不用骨架） -->
      <div v-if="modeLoading" v-loading="true" class="help-mode-loading" />
      <template v-else>
        <!-- 模式切换：文档 / AI 助手（会话内临时，不写后端；刷新回后端默认） -->
        <div class="help-mode-switch">
          <el-segmented v-model="mode" :options="modeOptions" />
        </div>
        <StaticHelp
          v-if="mode === 'static'"
          v-model:path="articlePath"
          :sections="sections"
          :article="article"
          :loading="loadingTree"
        />
        <AiHelp
          v-else
          :loading="aiLoading"
          :reply="aiReply"
          :health="health"
          :health-loading="healthLoading"
          :ai-model-name="aiModeName"
          @send="handleChat"
          @open-article="handleOpenArticle"
        />
      </template>
    </template>
  </BasicPage>
</template>

<script setup lang="ts">
defineOptions({ name: "Help" });

import { ref, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { fetchHelpMode, fetchHelpTree, fetchHelpArticle, chatHelp, fetchAiHealth } from "@/api/help";
import type { HelpSection, HelpArticle } from "@/types/help/static";
import type { AiHealth, HelpChatMessage, HelpChatResponse } from "@/types/help/ai";
import BasicPage from "@/components/page/basic/index.vue";
import StaticHelp from "@/components/help-center/static-help/index.vue";
import AiHelp from "@/components/help-center/ai-help/index.vue";

const { t, locale } = useI18n();

// 帮助模式：默认 static 兜底，进入页面时从后端获取
const mode = ref<"static" | "ai">("static");
/** 模式是否已从后端取回 */
const modeLoading = ref(true);
/** 当前使用的 AI 模型名称 */
const aiModeName = ref<string>("");

// —— 静态模式数据（容器获取，props 下传子组件）——
const sections = ref<HelpSection[]>([]);
const loadingTree = ref(true);
const articlePath = ref("");
const article = ref<HelpArticle | null>(null);

// —— AI 模式：健康度 + 页面骨架 ——
const health = ref<AiHealth | null>(null);
const healthLoading = ref(false);

// 静态状态下树状结构
async function loadTree() {
  loadingTree.value = true;
  try {
    sections.value = (await fetchHelpTree(locale.value as string)) ?? [];
  } catch {
    // 接口失败：空树兜底，页面走空态
    sections.value = [];
  } finally {
    loadingTree.value = false;
  }
}

// 静态状态下加载文字内容
async function loadArticle(path: string) {
  articlePath.value = path;
  try {
    article.value = (await fetchHelpArticle(locale.value as string, path)) ?? null;
  } catch {
    // 文章拉取失败（如 30004）：置空展示空态
    article.value = null;
  }
}

watch(articlePath, (path) => {
  if (path) {
    loadArticle(path);
  }
});

// 语言切换：整树 + 文章重新加载
watch(locale, () => {
  loadTree();
});

// AI 模式下的健康度检查
async function loadHealth() {
  healthLoading.value = true;
  try {
    const res = await fetchAiHealth();
    health.value = res ?? null;
    aiModeName.value = res?.model ?? "";
  } catch {
    // 健康检查失败（含未登录 10101）：置空 → 组件按离线兜底
    health.value = null;
  } finally {
    healthLoading.value = false;
  }
}

// —— AI 模式数据 ——
const aiLoading = ref(false);
const aiReply = ref<HelpChatResponse | null>(null);

//处理聊天
async function handleChat(question: string, history: Pick<HelpChatMessage, "role" | "content">[]) {
  aiLoading.value = true;
  aiReply.value = null;
  try {
    aiReply.value = await chatHelp({ question, locale: locale.value as string, history });
  } catch {
    // 失败：reply 保持 null，由 AiHelp 的 loading 回落展示 aiError
  } finally {
    aiLoading.value = false;
  }
}

/** 模式切换项（会话内临时，无持久化） */
const modeOptions = computed(() => [
  { label: t("help.modeDoc"), value: "static" },
  { label: t("help.modeAi"), value: "ai" }
]);

/** 点击 AI 回答引用：切 static 模式并定位文章（watch(articlePath) 驱动加载） */
function handleOpenArticle(path: string) {
  mode.value = "static";
  articlePath.value = path;
}

onMounted(() => {
  fetchHelpMode()
    .then((res) => {
      mode.value = res.mode;
      // 仅 ai 模式做健康检查（页面骨架挂在 healthLoading）
      if (res.mode === "ai") {
        loadHealth();
      }
    })
    .catch(() => {
      // 接口不可达时保持 static 兜底
    })
    .finally(() => {
      modeLoading.value = false;
    });
  loadTree();
});
</script>

<style scoped lang="less">
.help-mode-loading {
  height: 480px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--radius-lg);
}
.help-mode-switch {
  margin-bottom: @space-3;
}
</style>
