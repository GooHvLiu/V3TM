<template>
  <div class="ai-help">
    <!-- 页面级骨架：健康检查（初始化）期间 -->
    <AiHelpPageSkeleton v-if="healthLoading" />
    <template v-else>
      <!-- 健康状态条：在线（绿）/ 离线（红）/ 模型缺失（橙） -->
      <div v-if="health" class="ai-help-health" :class="healthStateClass">
        <span class="ai-help-health-dot" />
        <span>{{ healthText }}</span>
      </div>

      <div ref="listRef" class="ai-help-list">
        <div v-for="(message, index) in messages" :key="index" class="ai-help-msg" :class="message.role">
          <!-- AI 头像：系统 logo -->
          <div v-if="message.role === 'assistant'" class="ai-help-avatar">
            <BrandLogo />
          </div>
          <div class="ai-help-bubble">
            <div v-if="message.role === 'assistant'" class="ai-help-content" v-html="renderMarkdown(message.content)" />
            <template v-else>{{ message.content }}</template>
            <div v-if="message.sources?.length" class="ai-help-sources">
              <div class="ai-help-sources-title">{{ t("help.aiSources") }}</div>
              <div
                v-for="source in message.sources"
                :key="source.path"
                class="ai-help-source"
                role="button"
                tabindex="0"
                @click="goArticle(source.path)"
                @keydown.enter.prevent="goArticle(source.path)"
                @keydown.space.prevent="goArticle(source.path)"
              >
                {{ source.title }}
              </div>
            </div>
          </div>
          <!-- 用户头像：登录用户 -->
          <div v-if="message.role === 'user'" class="ai-help-avatar">
            <UserAvatar :name="user?.realName" :role="userRole" />
          </div>
        </div>
        <div v-if="loading" class="ai-help-msg assistant">
          <AiHelpReplySkeleton />
        </div>
      </div>

      <div class="ai-help-input">
        <el-input
          v-model="question"
          type="textarea"
          :rows="2"
          :disabled="!aiUsable"
          :placeholder="aiUsable ? t('help.aiPlaceholder') : t('help.aiDisabled')"
          @keydown.enter.exact.prevent="send"
        />
        <app-button tone="primary" :loading="loading" :disabled="!aiUsable" @click="send">
          {{ t("help.aiSend") }}
        </app-button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "AiHelp" });

import AiHelpReplySkeleton from "./reply-skeleton/index.vue";
import AiHelpPageSkeleton from "./page-skeleton/index.vue";

import { nextTick, ref, computed, watch, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import MarkdownIt from "markdown-it";
import type { HelpChatMessage, HelpChatResponse } from "@/types/help/ai";

import { useUserStore } from "@/stores";
import BrandLogo from "@/components/brand/logo/index.vue";
import UserAvatar from "@/components/user-info/avatar/index.vue";
import { runTypewriter } from "@/utils/help/typewriter";
import { loadHelpHistory, saveHelpHistory } from "@/utils/help/history";
import type { AiHealth } from "@/types";

/** 当前登录用户（realName / role 等） */
const userStore = useUserStore();
const user = computed(() => userStore.userProfile);

/** 头像角色：直接用后端下发值，缺失时由头像回退 */
const userRole = computed<string | null>(() => user.value?.role ?? null);

const { t } = useI18n();
const md = new MarkdownIt({ html: false, linkify: true });

// 容器传入：loading（请求中）、reply（回答结果）、health（健康态）、healthLoading（健康检查中）
const props = defineProps<{
  loading: boolean;
  reply: HelpChatResponse | null;
  health: AiHealth | null;
  healthLoading: boolean;
  aiModelName: string;
}>();

const emit = defineEmits<{
  (e: "send", question: string, history: Pick<HelpChatMessage, "role" | "content">[]): void;
  (e: "open-article", path: string): void;
}>();

const question = ref("");
// 历史优先：挂载时读本地历史，无历史再显示欢迎语
const messages = ref<HelpChatMessage[]>([]);
const listRef = ref<HTMLElement>();
/** 是否有一笔已发出、尚未收到回复的提问 */
const pendingAsk = ref(false);

/** 当前用户 id（未登录兜底 anonymous，多用户互不串线） */
const userId = computed(() => user.value?.id ?? "anonymous");

/** AI 是否可用（在线且模型存在才可提问） */
const aiUsable = computed(() => props.health?.available === true && props.health?.modelExists === true);

/** 健康状态三态 */
const healthState = computed<"online" | "offline" | "modelMissing">(() => {
  if (!props.health?.available) return "offline";
  return props.health.modelExists ? "online" : "modelMissing";
});

/** 健康状态样式类（kebab-case） */
const healthStateClass = computed(() => ({
  "is-online": healthState.value === "online",
  "is-offline": healthState.value === "offline",
  "is-model-missing": healthState.value === "modelMissing"
}));

const healthText = computed(() => {
  const map = {
    online: `${t("help.aiHealthOnline")} ${props.aiModelName}`,
    offline: t("help.aiHealthOffline"),
    modelMissing: t("help.aiHealthModelMissing")
  };
  return map[healthState.value];
});

onMounted(() => {
  // 恢复本地历史；无历史则显示欢迎语
  messages.value = loadHelpHistory(userId.value);
  if (!messages.value.length) {
    messages.value = [{ role: "assistant", content: t("help.aiWelcome") }];
  }
  // 历史/欢迎语渲染后，滚动定位到底部（最新一条）
  scrollToBottom();
});

// 消息变更即写本地：打字机高频写做 300ms 防抖，卸载前兜底落盘
let saveTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  messages,
  (list) => {
    if (!list.length) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveHelpHistory(userId.value, list), 300);
  },
  { deep: true }
);

onUnmounted(() => {
  clearTimeout(saveTimer);
  if (messages.value.length) saveHelpHistory(userId.value, messages.value);
});

function send() {
  const text = question.value.trim();
  if (!text || props.loading || !aiUsable.value) return;

  messages.value.push({ role: "user", content: text });
  question.value = "";
  pendingAsk.value = true;
  scrollToBottom();

  emit(
    "send",
    text,
    messages.value.map(({ role, content }) => ({ role, content }))
  );
}

// 收到回答：先入一条空气泡，再由打字机逐块写入（reactive 包装保证每块变更驱动视图）
watch(
  () => props.reply,
  (reply) => {
    if (!reply) return;
    pendingAsk.value = false;
    const msg = reactive<HelpChatMessage>({ role: "assistant", content: "", sources: reply.sources });
    messages.value.push(msg);
    const text = reply.answerKey ? t(reply.answerKey, reply.params ?? {}) : reply.answer;
    runTypewriter(msg, text, { onTick: scrollToBottom });
  }
);

// 请求结束但无回答（失败）：提示错误
watch(
  () => props.loading,
  (loading) => {
    if (!loading && pendingAsk.value) {
      pendingAsk.value = false;
      messages.value.push({ role: "assistant", content: t("help.aiError") });
    }
  }
);

// 健康检查结束、列表真正渲染后再兜底定位一次
watch(
  () => props.healthLoading,
  (loading) => {
    if (!loading) scrollToBottom();
  },
  { immediate: true } // 初始即 false（健康已就绪）时也触发一次
);

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) {
      listRef.value.scrollTop = listRef.value.scrollHeight;
    }
  });
}

/** 点击引用：上抛给容器，切 static 模式并定位文章 */
function goArticle(path: string) {
  emit("open-article", path);
}

/** 助手回答按 Markdown 渲染 */
function renderMarkdown(content: string): string {
  return md.render(content);
}
</script>

<style scoped lang="less">
.ai-help {
  display: flex;
  flex-direction: column;
  height: 560px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;

  .ai-help-health {
    display: flex;
    align-items: center;
    gap: @space-1-5;
    padding: @space-1-5 @space-3;
    margin: @space-3 @space-3 0;
    border-radius: var(--radius-sm);
    font-size: 12px;
    background: var(--el-fill-color-light);

    .ai-help-health-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    &.is-online {
      color: var(--el-color-success);
      .ai-help-health-dot {
        background: var(--el-color-success);
      }
    }

    &.is-offline {
      color: var(--el-color-danger);
      .ai-help-health-dot {
        background: var(--el-color-danger);
      }
    }

    &.is-model-missing {
      color: var(--el-color-warning);
      .ai-help-health-dot {
        background: var(--el-color-warning);
      }
    }
  }

  .ai-help-list {
    flex: 1;
    overflow: auto;
    padding: @space-4;
    .assistant {
      gap: 0px;
    }
  }

  .ai-help-msg {
    display: flex;
    align-items: flex-start;
    gap: @space-2-5;
    margin-bottom: @space-3;
    &.user {
      justify-content: flex-end;
    }
  }

  .ai-help-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: var(--radius-lg); /* 跟随主题圆角 */
    overflow: hidden;
    background: var(--el-fill-color-light);
  }

  .ai-help-bubble {
    max-width: 76%;
    padding: @space-2-5 @space-3;
    border-radius: var(--radius-lg);
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-primary);

    &.assistant & {
      background: var(--el-fill-color-light);
      border-top-left-radius: var(--radius-sm);
    }

    .user & {
      background: var(--el-color-primary);
      color: var(--el-color-white);
      border-top-right-radius: var(--radius-sm);
    }
  }

  .ai-help-sources {
    margin-top: @space-2-5;
    padding-top: @space-2;
    border-top: 1px dashed var(--el-border-color);
  }

  .ai-help-sources-title {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-bottom: @space-1;
  }

  .ai-help-source {
    font-size: 13px;
    color: var(--el-color-primary);
    cursor: pointer;
    padding: @space-0-5 0;
    &:hover {
      text-decoration: underline;
    }
  }

  .ai-help-input {
    display: flex;
    align-items: center;
    gap: @space-2-5;
    padding: @space-3;
    border-top: 1px solid var(--el-border-color);

    .el-input {
      flex: 1;
    }
  }

  :deep(.ai-help-content) {
    p {
      margin: @space-1 0;
    }
    strong {
      font-weight: 600;
    }
  }
}
</style>
