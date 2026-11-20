<template>
  <div class="page-wrap-design-system">
    <BasicPage
      :left-icon="true"
      :title="t('componentDemo.title')"
      :description="t('componentDemo.description')"
    >
      <template #content>
        <!-- 基础控件 -->
        <section class="ds-section">
          <h2 class="ds-section-title">{{ t("componentDemo.group.control") }}</h2>
          <div class="ds-grid">
            <app-card :title="t('componentDemo.demo.button.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.button.desc") }}</p>
              <div v-for="variant in variants" :key="variant.key" class="ds-row">
                <span class="ds-row-label">{{ t(variant.labelKey) }}</span>
                <div class="ds-row-body">
                  <app-button
                    v-for="tone in tones"
                    :key="tone"
                    :tone="tone"
                    :variant="variant.key"
                  >
                    {{ tone }}
                  </app-button>
                </div>
              </div>
              <div class="ds-row">
                <span class="ds-row-label">{{ t("componentDemo.label.sizeSm") }}</span>
                <div class="ds-row-body">
                  <app-button size="sm" tone="primary">sm</app-button>
                  <app-button size="md" tone="primary">md</app-button>
                  <app-button size="lg" tone="primary">lg</app-button>
                  <app-button tone="primary" disabled>disabled</app-button>
                </div>
              </div>
              <code class="ds-code">{{ t("componentDemo.label.codeButton") }}</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.tag.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.tag.desc") }}</p>
              <div class="ds-row">
                <span class="ds-row-label">{{ t("componentDemo.label.solid") }}</span>
                <div class="ds-row-body">
                  <app-tag v-for="tone in tones" :key="tone" :tone="tone">
                    {{ tone }}
                  </app-tag>
                </div>
              </div>
              <div class="ds-row">
                <span class="ds-row-label">{{ t("componentDemo.label.outline") }}</span>
                <div class="ds-row-body">
                  <app-tag v-for="tone in tones" :key="tone" :tone="tone" variant="outline" dot>
                    {{ tone }}
                  </app-tag>
                </div>
              </div>
              <code class="ds-code">{{ t("componentDemo.label.codeTag") }}</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.badge.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.badge.desc") }}</p>
              <div class="ds-row">
                <div class="ds-row-body ds-badge-row">
                  <app-badge :value="12"><span class="ds-badge-anchor" /></app-badge>
                  <app-badge :value="120" :max="99"><span class="ds-badge-anchor" /></app-badge>
                  <app-badge is-dot><span class="ds-badge-anchor" /></app-badge>
                </div>
              </div>
              <code class="ds-code">&lt;app-badge :value="12"&gt;…&lt;/app-badge&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.avatar.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.avatar.desc") }}</p>
              <div class="ds-row">
                <div class="ds-row-body">
                  <app-avatar size="sm">{{ t("componentDemo.label.avatarText") }}</app-avatar>
                  <app-avatar size="md">{{ t("componentDemo.label.avatarText") }}</app-avatar>
                  <app-avatar size="lg">{{ t("componentDemo.label.avatarText") }}</app-avatar>
                  <app-avatar size="md" shape="square" tone="primary">
                    {{ t("componentDemo.label.avatarText") }}
                  </app-avatar>
                </div>
              </div>
              <code class="ds-code">&lt;app-avatar size="md" shape="square"&gt;A&lt;/app-avatar&gt;</code>
            </app-card>
          </div>
        </section>

        <!-- 反馈与状态 -->
        <section class="ds-section">
          <h2 class="ds-section-title">{{ t("componentDemo.group.feedback") }}</h2>
          <div class="ds-grid">
            <app-card :title="t('componentDemo.demo.alert.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.alert.desc") }}</p>
              <div class="ds-stack">
                <app-alert
                  v-for="tone in alertTones"
                  :key="tone"
                  :tone="tone"
                  :title="tone"
                  :description="t('componentDemo.demo.alert.desc')"
                />
              </div>
              <code class="ds-code">&lt;app-alert tone="warning" title="…"&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.empty.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.empty.desc") }}</p>
              <app-empty :description="t('componentDemo.label.emptyDesc')" />
              <code class="ds-code">&lt;app-empty :description="…" /&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.errorState.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.errorState.desc") }}</p>
              <app-error-state
                :description="t('componentDemo.label.errorDesc')"
                code="503"
                show-retry
              />
              <code class="ds-code">&lt;app-error-state code="503" show-retry /&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.skeleton.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.skeleton.desc") }}</p>
              <div class="ds-row">
                <span class="ds-row-label">text</span>
                <div class="ds-row-body">
                  <app-skeleton variant="text" :rows="3" />
                </div>
              </div>
              <div class="ds-row">
                <span class="ds-row-label">list</span>
                <div class="ds-row-body">
                  <app-skeleton variant="list" :rows="3" />
                </div>
              </div>
              <div class="ds-row">
                <span class="ds-row-label">table</span>
                <div class="ds-row-body">
                  <app-skeleton variant="table" :rows="3" />
                </div>
              </div>
              <div class="ds-row">
                <span class="ds-row-label">chart</span>
                <div class="ds-row-body">
                  <app-skeleton variant="chart" />
                </div>
              </div>
              <code class="ds-code">&lt;app-skeleton variant="table" :rows="5" /&gt;</code>
            </app-card>
          </div>
        </section>

        <!-- 布局与容器 -->
        <section class="ds-section">
          <h2 class="ds-section-title">{{ t("componentDemo.group.layout") }}</h2>
          <div class="ds-grid">
            <app-card :title="t('componentDemo.demo.card.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.card.desc") }}</p>
              <div class="ds-row-body ds-card-row">
                <app-card title="bordered" hoverable>
                  <p class="ds-desc">bordered + hoverable</p>
                </app-card>
                <app-card title="plain">
                  <p class="ds-desc">{{ t("componentDemo.label.cardPlain") }}</p>
                </app-card>
              </div>
              <code class="ds-code">&lt;app-card title="…" hoverable&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.separator.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.separator.desc") }}</p>
              <div class="ds-stack">
                <app-separator />
                <app-separator>with label</app-separator>
                <div class="ds-row-body">
                  <span>left</span>
                  <app-separator orientation="vertical" />
                  <span>right</span>
                </div>
              </div>
              <code class="ds-code">&lt;app-separator&gt;with label&lt;/app-separator&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.tabs.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.tabs.desc") }}</p>
              <app-tabs v-model="activeTab" :items="tabItems">
                <template #content>
                  <p class="ds-desc">{{ t("componentDemo.label.tabsBody") }}</p>
                </template>
              </app-tabs>
              <code class="ds-code">&lt;app-tabs v-model="active" :items="items"&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.tooltip.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.tooltip.desc") }}</p>
              <div class="ds-row-body">
                <app-tooltip :content="t('componentDemo.label.tooltipContent')" placement="top">
                  <app-button variant="outline">{{ t("componentDemo.label.tooltipContent") }}</app-button>
                </app-tooltip>
                <app-tooltip :content="t('componentDemo.label.tooltipContent')" placement="right">
                  <app-button variant="ghost">{{ t("componentDemo.demo.tooltip.title") }}</app-button>
                </app-tooltip>
              </div>
              <code class="ds-code">&lt;app-tooltip content="…" placement="top"&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.dialog.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.dialog.desc") }}</p>
              <app-button tone="primary" @click="dialogOpen = true">
                {{ t("componentDemo.label.openDialog") }}
              </app-button>
              <app-dialog v-model="dialogOpen" :title="t('componentDemo.label.dialogTitle')">
                <p class="ds-desc">{{ t("componentDemo.label.dialogBody") }}</p>
              </app-dialog>
              <code class="ds-code">&lt;app-dialog v-model="open" title="…"&gt;</code>
            </app-card>

            <app-card :title="t('componentDemo.demo.drawer.title')" shadow="never">
              <p class="ds-desc">{{ t("componentDemo.demo.drawer.desc") }}</p>
              <app-button tone="primary" @click="drawerOpen = true">
                {{ t("componentDemo.label.openDrawer") }}
              </app-button>
              <app-drawer v-model="drawerOpen" :title="t('componentDemo.label.drawerTitle')">
                <p class="ds-desc">{{ t("componentDemo.label.drawerBody") }}</p>
              </app-drawer>
              <code class="ds-code">&lt;app-drawer v-model="open" title="…"&gt;</code>
            </app-card>
          </div>
        </section>

        <!-- 业务组件 -->
        <section class="ds-section">
          <h2 class="ds-section-title">{{ t("componentDemo.group.business") }}</h2>
          <div class="ds-grid">
            <app-card
              v-for="item in businessItems"
              :key="item.key"
              :title="t(`componentDemo.demo.${item.key}.title`)"
              hoverable
            >
              <p class="ds-desc">{{ t(`componentDemo.demo.${item.key}.desc`) }}</p>
              <app-button variant="link" tone="primary" @click="openDocs(item.docs)">
                {{ t("componentDemo.label.docs") }}
              </app-button>
            </app-card>
          </div>
        </section>
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "DesignSystem" });

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import BasicPage from "@/components/page/basic/index.vue";

const { t } = useI18n();

const tones = ["primary", "success", "warning", "danger", "neutral"] as const;
const alertTones = ["info", "success", "warning", "danger"] as const;

const variants = [
  { key: "solid", labelKey: "componentDemo.label.solid" },
  { key: "outline", labelKey: "componentDemo.label.outline" },
  { key: "ghost", labelKey: "componentDemo.label.ghost" },
  { key: "link", labelKey: "componentDemo.label.link" }
] as const;

const activeTab = ref("overview");
const dialogOpen = ref(false);
const drawerOpen = ref(false);

// 标签文案跟随语言切换
const tabItems = computed(() => [
  { value: "overview", label: t("componentDemo.label.tabOverview") },
  { value: "config", label: t("componentDemo.label.tabConfig") },
  { value: "stats", label: t("componentDemo.label.tabStats") }
]);

const businessItems = [
  { key: "table", docs: "https://goohvliu.github.io/V3TM/business/pro-table" },
  { key: "form", docs: "https://goohvliu.github.io/V3TM/business/pro-form" },
  { key: "chart", docs: "https://goohvliu.github.io/V3TM/business/base-chart" }
];

const openDocs = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};
</script>

<style scoped lang="less">
.ds-section {
  display: flex;
  flex-direction: column;
  gap: @space-3;
  margin-bottom: @space-6;
}

.ds-section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ds-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: @space-4;
}

.ds-desc {
  margin: 0 0 @space-3;
  font-size: 13px;
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.ds-row {
  display: flex;
  gap: @space-3;
  padding: @space-2 0;
}

.ds-row-label {
  flex: 0 0 48px;
  font-size: 12px;
  line-height: 32px;
  color: var(--el-text-color-placeholder);
}

.ds-row-body {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: @space-2;
  align-items: center;
  min-width: 0;
}

.ds-badge-row {
  gap: 28px;
}

.ds-badge-anchor {
  display: inline-block;
  width: 44px;
  height: 44px;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-base);
  background: var(--el-fill-color-light);
}

.ds-card-row > :deep(.app-card) {
  flex: 1;
  min-width: 0;
}

.ds-stack {
  display: flex;
  flex-direction: column;
  gap: @space-3;
}

.ds-code {
  display: block;
  margin-top: @space-3;
  padding: @space-2 @space-2-5;
  font-family: var(--el-font-family-mono, ui-monospace, monospace);
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  overflow-wrap: anywhere;
  background: var(--el-fill-color-lighter);
  border-radius: var(--el-border-radius-small);
}

@media (max-width: 1100px) {
  .ds-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
