<template>
  <div class="page-wrap-app-down">
    <BasicPage :left-icon="true" :title="t('appDown.title')" :description="t('appDown.description')">
      <template #content>
        <!-- 应用截图：占位轮播 -->
        <app-card padding="xl" shadow="never" class="app-down-block">
          <template #header>
            <div class="app-down-block-head">
              <span class="app-down-block-icon">
                <el-icon><i-carbon-image /></el-icon>
              </span>
              <span>{{ t("appDown.screenshots") }}</span>
            </div>
          </template>
          <el-carousel height="320px" indicator-position="outside">
            <el-carousel-item v-for="(shot, index) in screenshots" :key="index">
              <div class="shot-placeholder" :style="{ background: shot }">
                <div class="phone-mockup">
                  <div class="phone-mockup-bar" />
                  <div class="phone-mockup-screen">
                    <span>{{ t("appDown.shotPlaceholder") }}</span>
                  </div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </app-card>

        <!-- 下载平台：每个平台一个卡片，网盘下载按钮组 -->
        <app-card padding="xl" shadow="never" class="app-down-block">
          <template #header>
            <div class="app-down-block-head">
              <span class="app-down-block-icon">
                <el-icon><i-carbon-download /></el-icon>
              </span>
              <span>{{ t("appDown.platforms") }}</span>
            </div>
          </template>
          <div class="platform-grid">
            <div v-for="p in platforms" :key="p.key" class="platform-card">
              <div class="platform-card-head">
                <div class="platform-card-title">
                  <span class="platform-card-icon">
                    <el-icon>
                      <i-carbon-apple v-if="p.key === 'ios'" />
                      <i-carbon-mobile v-else-if="p.key === 'android'" />
                      <i-carbon-devices v-else />
                    </el-icon>
                  </span>
                  <span class="platform-card-name">{{ t(`appDown.platform.${p.key}`) }}</span>
                </div>
                <app-tag size="small" type="info">{{ t(`appDown.device.${p.key}`) }}</app-tag>
              </div>
              <div class="platform-card-stores">
                <app-button v-for="s in p.stores" :key="s.storeKey" size="sm" variant="outline" @click="openStore(s.url)">
                  {{ t(`appDown.store.${s.storeKey}`) }}
                </app-button>
              </div>
            </div>
          </div>
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
defineOptions({ name: "AppDown" });

// 加载品牌 logo
import BrandLogo from "@/components/brand/logo/index.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

// 加载通用骨架 base-page
import BasicPage from "@/components/page/basic/index.vue";

// 截图占位背景
const screenshots = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
];

// 下载平台与网盘链接
const platforms = [
  {
    key: "ios",
    stores: [
      { storeKey: "baidu", url: "https://pan.baidu.com/s/example" },
      { storeKey: "alipan", url: "https://www.alipan.com/s/example" }
    ]
  },
  {
    key: "android",
    stores: [
      { storeKey: "baidu", url: "https://pan.baidu.com/s/example" },
      { storeKey: "lanzou", url: "https://www.lanzou.com/example" }
    ]
  },
  {
    key: "pad",
    stores: [{ storeKey: "alipan", url: "https://www.alipan.com/s/example" }]
  }
];

// 打开网盘下载外链（noopener 防新页篡改，链接为空时静默）
const openStore = (url: string): void => {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
};
</script>

<style scoped lang="less">
.page-wrap-app-down {
  .app-down-block {
    position: relative;
    overflow: hidden;
    margin-bottom: @space-4;

    /* 卡片顶部品牌色渐变条 */
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(
        90deg,
        var(--color-primary) 0%,
        color-mix(in srgb, var(--color-primary) 35%, transparent) 100%
      );
    }

    .app-down-block-head {
      display: flex;
      align-items: center;
      gap: @space-2;

      span {
        font-weight: 800;
      }
    }

    /* header 图标：圆角色块 */
    .app-down-block-icon {
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
  }
  .shot-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
  }

  /* CSS 手机 mockup：渐变底上叠手机框 */
  .phone-mockup {
    width: 108px;
    height: 220px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.14);
    border: 2px solid rgba(255, 255, 255, 0.55);
    padding: @space-2;
    display: flex;
    flex-direction: column;
    gap: @space-1-5;

    .phone-mockup-bar {
      width: 40px;
      height: 12px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.35);
      align-self: center;
    }

    .phone-mockup-screen {
      flex: 1;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 12px;
    }
  }
  .platform-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: @space-3;

    .platform-card {
      padding: @space-3;
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;

      /* 悬停轻微提升 */
      &:hover {
        border-color: var(--el-border-color);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }

      .platform-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: @space-3;
      }

      .platform-card-title {
        display: flex;
        align-items: center;
        gap: @space-2;
      }

      /* 平台图标：圆角色块（与页面头部图标一致） */
      .platform-card-icon {
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

      .platform-card-name {
        font-weight: 600;
        font-size: 14px;
      }

      .platform-card-stores {
        display: flex;
        flex-wrap: wrap;
        gap: @space-2;
      }
    }
  }
}
</style>
