<template>
  <div class="page-wrap-breadcrumb-nav">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item
        v-for="breadcrumb in breadcrumbs"
        :key="breadcrumb.title"
        :to="breadcrumb.path || undefined"
        >{{ breadcrumb.title }}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup lang="ts">
// 定义组件名字
defineOptions({ name: "BreadcrumbNav" });

// 引入数据类型
import type { BreadcrumbData } from "@/types/index";

// 引入 element plus 图标
import { ArrowRight } from "@element-plus/icons-vue";

// 引入常量
import { BREADCRUMBS_KEY } from "@/constants";

import { ref, inject } from "vue";

import type { Ref } from "vue";

// 接收父组件传递进来的面包屑数据
const breadcrumbs = inject<Ref<BreadcrumbData[]>>(BREADCRUMBS_KEY, ref([]));
</script>

<style scoped lang="less">
.page-wrap-breadcrumb-nav {
  font-size: 0.85rem;
}
:deep(.el-breadcrumb) {
  display: flex;
  align-items: center;
}
</style>
