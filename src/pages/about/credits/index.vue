<template>
  <div class="page-wrap-credits">
    <BasicPage :left-icon="true" :title="t('credits.title')" :description="t('credits.description')">
      <template #content>
        <!-- 项目简介 -->
        <app-card padding="xl" shadow="never" class="credits-block">
          <template #header>
            <div class="credits-block-head">
              <span class="credits-block-icon">
                <el-icon><i-carbon-information /></el-icon>
              </span>
              <span>{{ t("credits.project") }}</span>
            </div>
          </template>
          <p class="credits-text">{{ t("credits.projectContent") }}</p>
        </app-card>

        <!-- 开源依赖致谢 -->
        <app-card padding="xl" shadow="never" class="credits-block">
          <template #header>
            <div class="credits-block-head">
              <span class="credits-block-icon">
                <el-icon><i-carbon-data-base /></el-icon>
              </span>
              <span>{{ t("credits.dependencies") }}</span>
            </div>
          </template>
          <p class="credits-text">{{ t("credits.dependenciesDesc") }}</p>
          <div class="credits-grid">
            <div v-for="dep in dependencies" :key="dep.name" class="credits-grid-item">
              <div class="credits-grid-head">
                <div class="credits-grid-title">
                  <app-avatar
                    :size="22"
                    shape="square"
                    class="credits-grid-initial"
                    :style="{ '--el-avatar-bg-color': dep.color }"
                  >
                    {{ dep.name.charAt(0) }}
                  </app-avatar>
                  <span class="credits-grid-name">{{ dep.name }}</span>
                </div>
                <app-tag size="small" type="info">{{ dep.version }}</app-tag>
              </div>
              <p class="credits-grid-desc">{{ t(dep.descKey) }}</p>
            </div>
          </div>
        </app-card>

        <!-- 支持与版权 -->
        <app-card padding="xl" shadow="never" class="credits-block">
          <template #header>
            <div class="credits-block-head">
              <span class="credits-block-icon">
                <el-icon><i-carbon-license /></el-icon>
              </span>
              <span>{{ t("credits.support") }}</span>
            </div>
          </template>
          <p class="credits-text">{{ t("credits.supportContent", productInfo) }}</p>
          <p class="credits-copyright">{{ t("credits.copyright") }}</p>
        </app-card>
      </template>
      <template #icon>
        <BrandLogo />
      </template>
    </BasicPage>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Credits" });

// 加载品牌 logo
import BrandLogo from "@/components/brand/logo/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 加载通用骨架 base-page
import BasicPage from "@/components/page/basic/index.vue";

// 开源依赖清单
const dependencies = [
  { name: "Vue", version: "^3.x", descKey: "credits.deps.vue", color: "#41b883" },
  { name: "Vue Router", version: "^4.x", descKey: "credits.deps.vueRouter", color: "#42b883" },
  { name: "Pinia", version: "^2.x", descKey: "credits.deps.pinia", color: "#ffd859" },
  { name: "Element Plus", version: "^2.14.x", descKey: "credits.deps.elementPlus", color: "#409eff" },
  { name: "vue-i18n", version: "^9.x", descKey: "credits.deps.vueI18n", color: "#0077ff" },
  { name: "Axios", version: "^1.x", descKey: "credits.deps.axios", color: "#5a29e4" },
  { name: "ECharts", version: "^5.x", descKey: "credits.deps.echarts", color: "#aa344f" }
];

// 产品信息（对外展示的归属与联系方式）
const productInfo = {
  name: "Public Repository",
  contact: "example@example.com"
};
</script>

<style scoped lang="less">
.page-wrap-credits {
  .credits-block {
    margin-bottom: @space-4;

    .credits-block-head {
      display: flex;
      align-items: center;
      gap: @space-2;

      span {
        font-weight: 800;
      }
    }

    /* header 图标：圆角色块 */
    .credits-block-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);

      .el-icon {
        color: @color-primary;
        font-size: 16px;
      }
    }

    .credits-text {
      color: @color-text-secondary;
      line-height: 1.8;
      margin: 0 0 @space-3;
    }
  }
  .credits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: @space-3;
    .credits-grid-item {
      padding: @space-3 @space-3;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
      &:hover {
        border-color: var(--el-border-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
    }
    .credits-grid-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: @space-2;
    }
    .credits-grid-title {
      display: flex;
      align-items: center;
      gap: @space-2;
    }
    .credits-grid-initial {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 6px;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .credits-grid-name {
      font-weight: 600;
      font-size: 14px;
    }
    .credits-grid-desc {
      margin: @space-2 0 0;
      color: @color-text-secondary;
      font-size: 12px;
      line-height: 1.6;
    }
  }
  .credits-copyright {
    color: @color-text-regular;
    font-size: 12px;
    margin: 0;
  }
}
</style>
