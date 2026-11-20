<template>
  <div ref="panelRef" v-loading="loading" class="settings-panel">
    <!-- 左侧分区导航 -->
    <div class="settings-nav">
      <div
        v-for="group in groups"
        :key="group.key"
        class="settings-nav-item"
        role="button"
        tabindex="0"
        :class="{ active: activeSection === group.key }"
        @click="scrollToSection(group.key)"
        @keydown.enter.prevent="scrollToSection(group.key)"
        @keydown.space.prevent="scrollToSection(group.key)"
      >
        <el-icon class="settings-nav-icon"><component :is="groupIcon(group.key)" /></el-icon>
        <span>{{ t(`${group.prefix}.sections.${group.key}.title`) }}</span>
      </div>
    </div>

    <!-- 右侧分区表单 -->
    <div class="settings-body">
      <section v-for="group in groups" :id="sectionId(group.key)" :key="group.key" class="settings-section">
        <h3 class="settings-title">{{ t(`${group.prefix}.sections.${group.key}.title`) }}</h3>
        <p class="settings-desc">{{ t(`${group.prefix}.sections.${group.key}.desc`) }}</p>
        <!-- 分区附加区：诊断、测试类内容由页面按分组注入 -->
        <slot name="section-extra" :group="group" />
        <div class="settings-form">
          <ConfigRow
            v-for="item in group.items"
            :key="item.configKey"
            :label="labelOf(item)"
            :tip="tipOf(item)"
          >
            <div class="settings-value">
              <el-select
                v-if="item.valueType === 'enum'"
                v-model="values[item.configKey]"
                :aria-label="labelOf(item)"
                :disabled="!canEdit(item)"
                @change="onChange(item, $event)"
              >
                <el-option
                  v-for="opt in item.validation?.options ?? []"
                  :key="opt"
                  :label="optionLabel(item, opt)"
                  :value="opt"
                />
              </el-select>

              <!-- 配置值统一是字符串，开关在控件侧做一次映射 -->
              <el-switch
                v-else-if="item.valueType === 'boolean'"
                :model-value="values[item.configKey] === 'true'"
                :aria-label="labelOf(item)"
                :disabled="!canEdit(item)"
                @update:model-value="onChange(item, $event)"
              />

              <el-input-number
                v-else-if="item.valueType === 'number'"
                v-model="numberValues[item.configKey]"
                :aria-label="labelOf(item)"
                :min="item.validation?.min"
                :max="item.validation?.max"
                :step="item.validation?.step ?? 1"
                :precision="item.validation?.integer ? 0 : undefined"
                :disabled="!canEdit(item)"
                @change="onChange(item, $event)"
              />

              <el-date-picker
                v-else-if="item.validation?.format === 'date'"
                v-model="values[item.configKey]"
                :aria-label="labelOf(item)"
                type="date"
                value-format="YYYY-MM-DD"
                :disabled="!canEdit(item)"
                @change="onChange(item, $event)"
              />

              <!-- 敏感参数：聚焦清掩码，失焦为空即还原，不提交空串 -->
              <el-input
                v-else-if="item.sensitive"
                v-model="values[item.configKey]"
                type="password"
                :aria-label="labelOf(item)"
                show-password
                autocomplete="new-password"
                :maxlength="item.validation?.maxLength"
                :disabled="!canEdit(item)"
                :placeholder="t('superSettings.mail.passPlaceholder')"
                @focus="onSensitiveFocus(item)"
                @blur="onSensitiveBlur(item)"
                @keyup.enter="onSensitiveBlur(item)"
              />

              <el-input
                v-else
                v-model="values[item.configKey]"
                :aria-label="labelOf(item)"
                :maxlength="item.validation?.maxLength"
                :disabled="!canEdit(item)"
                @change="onChange(item, $event)"
                @keyup.enter="submitOnEnter(item)"
              />

              <app-tag class="settings-source" size="small" :type="sourceType(item.source)" effect="plain">
                {{ t(`settings.source.${item.source}`) }}
              </app-tag>
            </div>
          </ConfigRow>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { hasPermission } from "@/utils";
import { useUserStore } from "@/stores";
import { useConfigStore } from "@/stores/modules/config";
import type { ConfigScope, SystemConfigItem } from "@/types";
import { SENSITIVE_CONFIG_MASK } from "@/constants";
import { useI18n } from "vue-i18n";
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import type { Component } from "vue";
import { ElMessage } from "@/utils/element-plus";
import ConfigRow from "@/components/settings/config-row/index.vue";
import {
  Setting,
  QuestionFilled,
  Search,
  OfficeBuilding,
  ChatDotRound,
  Document,
  FirstAidKit,
  Timer,
  DataLine,
  Tools,
  Collection,
  UploadFilled,
  Lock,
  Message,
  Files
} from "@element-plus/icons-vue";
import { translateMessage } from "@/utils/request";

defineOptions({ name: "SettingsPanel" });

const props = defineProps<{ scope: ConfigScope }>();

const { t } = useI18n();
const userStore = useUserStore();
const configStore = useConfigStore();

/** 页面只读键：默认语言由顶栏切换写入，本页仅展示 */
const READONLY_KEYS = ["default_locale"];

/** 分组图标：help 在两域含义不同（帮助中心 / 知识检索），按域取值 */
const GROUP_ICONS: Record<string, Component> = {
  general: Setting,
  help: props.scope === "system" ? QuestionFilled : Search,
  site: OfficeBuilding,
  ai: ChatDotRound,
  legal: Document,
  health: FirstAidKit,
  session: Timer,
  metrics: DataLine,
  ops: Tools,
  dict: Collection,
  upload: UploadFilled,
  login: Lock,
  mail: Message,
  log: Files
};

/** 写权限按页面域切换；读接口对系统页返回的是全量公开项 */
const updatePermission = computed(() =>
  props.scope === "system" ? "systemSettings:config:update" : "superAdmin:settings:update"
);

/** 条目文案归属：按参数自身所属域取，系统页也会展示超级域中公开只读的项 */
const itemPrefix = (item: SystemConfigItem): string =>
  item.configScope === "system" ? "settings" : "superSettings";

/** 参数名称取后端下发的 config.<key>.description，缺词条时回退旧标签 */
const labelOf = (item: SystemConfigItem): string => {
  const key = item.description ?? `config.${item.configKey}.description`;
  const text = t(key);
  return text === key ? t(`${itemPrefix(item)}.items.${item.configKey}`) : text;
};

/** 悬浮提示保留参数用途说明，缺词条时不展示 */
const tipOf = (item: SystemConfigItem): string => {
  const key = `${itemPrefix(item)}.items.${item.configKey}Tip`;
  const text = t(key);
  return text === key ? "" : text;
};

const items = computed<SystemConfigItem[]>(() =>
  props.scope === "system" ? configStore.list : configStore.superList
);
const loading = computed(() => (props.scope === "system" ? configStore.loading : configStore.superLoading));

/** 分区：先按域过滤后的参数按 configGroup 聚合，顺序取组内最小 sort */
const groups = computed<Array<{ key: string; prefix: string; items: SystemConfigItem[] }>>(() => {
  const buckets = new Map<string, SystemConfigItem[]>();
  items.value.forEach((item) => {
    const bucket = buckets.get(item.configGroup) ?? [];
    bucket.push(item);
    buckets.set(item.configGroup, bucket);
  });
  return [...buckets.entries()]
    .map(([key, list]) => ({
      key,
      prefix: itemPrefix(list[0]),
      items: [...list].sort((a, b) => a.sort - b.sort || a.id - b.id)
    }))
    .sort((a, b) => a.items[0].sort - b.items[0].sort);
});

const groupIcon = (key: string): Component => GROUP_ICONS[key] ?? Setting;

const sectionId = (key: string): string => `${props.scope}-${key}`;

/** 表单值（字符串）与数值控件的数值镜像 */
const values = reactive<Record<string, string>>({});
const numberValues = reactive<Record<string, number | undefined>>({});
/** 最近一次后端确认值，用于保存失败回滚 */
const confirmed = reactive<Record<string, string>>({});
/** 逐键保存中标记，避免重复提交 */
const saving = reactive<Record<string, boolean>>({});

const isReadonly = (item: SystemConfigItem): boolean =>
  props.scope === "system" && READONLY_KEYS.includes(item.configKey);

const canEdit = (item: SystemConfigItem): boolean =>
  hasPermission(userStore.permissions, updatePermission.value) &&
  item.editable === 1 &&
  !isReadonly(item) &&
  !saving[item.configKey];

const optionLabel = (item: SystemConfigItem, opt: string): string => {
  const key = `${itemPrefix(item)}.options.${item.configKey}.${opt}`;
  const label = t(key);
  return label === key ? opt : label;
};

const sourceType = (source: SystemConfigItem["source"]): "success" | "warning" | "info" => {
  if (source === "db") return "success";
  if (source === "env") return "warning";
  return "info";
};

/** 后端返回的是失败标识，统一走 error 命名空间；空标识回落通用失败文案 */
const resolveError = (error: unknown): string => {
  const code = (error as Error)?.message ?? "";
  return code ? translateMessage(code) : t("settings.saveFailed");
};

const syncValues = (): void => {
  items.value.forEach((item) => {
    // 生效值优先，库值缺失时退回代码默认值，避免空白控件
    const initial = item.configValue || item.defaultValue || "";
    values[item.configKey] = initial;
    confirmed[item.configKey] = initial;
    if (item.valueType === "number") {
      numberValues[item.configKey] = initial === "" ? undefined : Number(initial);
    }
  });
};

/** 提交单键：成功记确认值，失败回滚控件并保持当前语言/输入 */
const commit = async (item: SystemConfigItem, next: string): Promise<void> => {
  const key = item.configKey;
  if (next === confirmed[key]) {
    values[key] = next;
    return;
  }
  saving[key] = true;
  try {
    if (props.scope === "system") await configStore.saveConfig({ key, value: next }, true);
    else await configStore.saveSuperConfig({ key, value: next }, true);
    confirmed[key] = next;
    values[key] = next;
    if (item.valueType === "number") numberValues[key] = next === "" ? undefined : Number(next);
    ElMessage.success(t("settings.saved"));
  } catch (error) {
    values[key] = confirmed[key];
    if (item.valueType === "number") {
      numberValues[key] = confirmed[key] === "" ? undefined : Number(confirmed[key]);
    }
    ElMessage.error(resolveError(error));
  } finally {
    saving[key] = false;
  }
};

const onChange = (item: SystemConfigItem, raw: string | number | boolean | null | undefined): void => {
  const next = raw === null || raw === undefined ? "" : String(raw);
  values[item.configKey] = next;
  if (item.valueType === "number") numberValues[item.configKey] = next === "" ? undefined : Number(next);
  void commit(item, next);
};

/** 回车即提交，不等失焦 */
const submitOnEnter = (item: SystemConfigItem): void => {
  void commit(item, values[item.configKey]);
};

/** 敏感参数聚焦：掩码先清空，让用户直接输入新值 */
const onSensitiveFocus = (item: SystemConfigItem): void => {
  const key = item.configKey;
  if (values[key] === SENSITIVE_CONFIG_MASK) values[key] = "";
};

/** 敏感参数提交：空值视为未修改，成功后恢复掩码，明文不留在表单里 */
const commitSensitive = async (item: SystemConfigItem): Promise<void> => {
  const key = item.configKey;
  const next = (values[key] ?? "").trim();
  if (!next || next === SENSITIVE_CONFIG_MASK) {
    values[key] = confirmed[key];
    return;
  }
  if (next === confirmed[key]) {
    values[key] = SENSITIVE_CONFIG_MASK;
    return;
  }
  saving[key] = true;
  try {
    await configStore.saveSuperConfig({ key, value: next }, true);
    confirmed[key] = SENSITIVE_CONFIG_MASK;
    values[key] = SENSITIVE_CONFIG_MASK;
    ElMessage.success(t("settings.saved"));
  } catch (error) {
    values[key] = confirmed[key];
    ElMessage.error(resolveError(error));
  } finally {
    saving[key] = false;
  }
};

const onSensitiveBlur = (item: SystemConfigItem): void => {
  void commitSensitive(item);
};

/** 页面根节点与真实滚动容器 */
const panelRef = ref<HTMLElement | null>(null);
const activeSection = ref<string>("");
let scroller: HTMLElement | null = null;
let observer: IntersectionObserver | null = null;

/** 点击跳转期间暂停观察器：平滑滚动会连续跨越多个分组，高亮会跟着来回跳 */
const observerLocked = ref(false);
let unlockTimer: number | null = null;

/** 滚动仍在继续时不断推迟解锁，停下约 260ms 后恢复观察 */
const scheduleUnlock = (): void => {
  if (unlockTimer) window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => {
    observerLocked.value = false;
    unlockTimer = null;
  }, 260);
};

const getScroller = (el: HTMLElement | null): HTMLElement | null => {
  let node: HTMLElement | null = el;
  while (node) {
    if (node.scrollHeight > node.clientHeight + 4) return node;
    node = node.parentElement;
  }
  return null;
};

const scrollToSection = (key: string): void => {
  activeSection.value = key;
  observerLocked.value = true;
  scheduleUnlock();
  document.getElementById(sectionId(key))?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** 滚到底兜底：末组内容少时顶部进不了观察条带 */
const onScrollerScroll = (): void => {
  // 跳转还没停下，继续推迟解锁，不抢高亮
  if (observerLocked.value) {
    scheduleUnlock();
    return;
  }

  const last = groups.value[groups.value.length - 1];
  if (!last || !scroller) return;
  if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) activeSection.value = last.key;
};

const initObserver = (): void => {
  observer = new IntersectionObserver(
    (entries) => {
      if (observerLocked.value) return;

      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) activeSection.value = visible[0].target.id.replace(`${props.scope}-`, "");
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
  );
  groups.value.forEach((group) => {
    const el = document.getElementById(sectionId(group.key));
    if (el) observer?.observe(el);
  });
};

onMounted(async () => {
  await (props.scope === "system" ? configStore.fetchConfig() : configStore.fetchSuperConfig());
  syncValues();
  if (groups.value[0]) activeSection.value = groups.value[0].key;
  initObserver();
  scroller = getScroller(panelRef.value);
  scroller?.addEventListener("scroll", onScrollerScroll, { passive: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  if (unlockTimer) window.clearTimeout(unlockTimer);
  unlockTimer = null;
  scroller?.removeEventListener("scroll", onScrollerScroll);
  scroller = null;
});

/**
 * 等待未落库的输入提交完成
 * 页面在发诊断类请求前调用，避免测到旧配置
 */
const flush = async (): Promise<void> => {
  const active = document.activeElement;
  if (active instanceof HTMLElement && panelRef.value?.contains(active)) active.blur();
  await new Promise((resolve) => setTimeout(resolve, 50));
  let guard = 0;
  while (Object.values(saving).some(Boolean) && guard < 50) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    guard += 1;
  }
};

defineExpose({ flush });
</script>

<style scoped lang="less">
.settings-panel {
  display: flex;
  gap: @space-5;
  align-items: flex-start;
}

.settings-nav {
  flex: 0 0 176px;
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: @space-1;
}

.settings-nav-item {
  display: flex;
  align-items: center;
  gap: @space-2-5;
  padding: @space-2-5 @space-3;
  font-size: 14px;
  color: var(--color-text-primary, #1f2329);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &.active {
    background-color: var(--color-primary, #3370ff);
    color: #fff;
  }
}

.settings-nav-icon {
  font-size: 16px;
}

.settings-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: @space-4;
  padding-bottom: @space-6;
}

.settings-section {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: var(--radius-lg);
  padding: @space-5;
  /* 跳转落点留出上边距，标题不贴着容器顶边 */
  scroll-margin-top: @space-4;
}

.settings-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary, #1f2329);
}

.settings-desc {
  margin: @space-1-5 0 0;
  font-size: 14px;
  color: var(--color-text-secondary, #646a73);
}

.settings-form {
  margin-top: @space-3;
}

.settings-value {
  display: flex;
  align-items: center;
  gap: @space-2;
  width: 100%;

  :deep(.el-select),
  :deep(.el-date-editor) {
    flex: 1;
  }
}

.settings-source {
  flex: 0 0 auto;
}

/* 窄到放不下侧栏时改为上下结构，导航转横向可滑动 */
@media (max-width: @tablet-max) {
  .settings-panel {
    flex-direction: column;
    gap: @space-4;
  }

  .settings-nav {
    flex: 1 1 auto;
    position: static;
    flex-direction: row;
    gap: @space-2;
    padding-bottom: @space-1;
    overflow-x: auto;
  }
}
</style>
