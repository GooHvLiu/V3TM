<template>
  <LegalLayout>
    <LegalDoc
      :data="docData"
      :version-label="t('terms.meta.version')"
      :effective-date-label="t('terms.meta.effectiveDate')"
      :update-date-label="t('terms.meta.updateDate')"
      :toc-title="t('legal.tocTitle')"
    />
  </LegalLayout>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "Privacy" }); // Terms 文件此处写 { name: "Terms" }

// 引入子组件
import LegalLayout from "@/components/legal/layout/index.vue";
import LegalDoc from "@/components/legal/doc/index.vue";

// 引入系统配置 store（法务常量运行时可配，未加载回退常量兜底）
import { useConfigStore } from "@/stores/modules/config";

import { useI18n } from "vue-i18n";
const { t, tm } = useI18n();

// 引入数据类型
import type { LegalSection, LegalDocData } from "@/types";

// 组合式 API
import { computed } from "vue";

const configStore = useConfigStore();

// tm() 取结构化消息（t() 只返回 string，取数组必须用 tm）+ 类型断言
const rawSections = tm("privacy.sections") as unknown as LegalSection[];
// Terms 文件此行用 tm("terms.sections")

// 组装文档数据：i18n 文案 + 运行时配置插值（统一替换 {company} / {email}）
const docData = computed<LegalDocData>(() => ({
  title: t("privacy.title"), // Terms 文件用 t("terms.title")
  version: configStore.legalVersion,
  effectiveDate: configStore.legalEffectiveDate,
  updateDate: configStore.legalUpdateDate,
  intro: t("privacy.intro", { company: configStore.sellerName }), // Terms 文件用 t("terms.intro", ...)
  sections: rawSections.map((section, index) => ({
    id: section.id ?? `sec-${index}`,
    title: section.title,
    paragraphs: section.paragraphs.map((paragraph) =>
      paragraph.replace(/\{company\}/g, configStore.sellerName).replace(/\{email\}/g, configStore.contactEmail)
    )
  }))
}));
</script>
