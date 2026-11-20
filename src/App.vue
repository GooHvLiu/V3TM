<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <!-- 以下为通过 router 跳转部分 -->
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
defineOptions({ name: "App" });

// Element Plus 组件与服务的统一中文语言包
import zhCn from "element-plus/es/locale/lang/zh-cn";

// 引入 主题应用：监听 theme 变化
import { useSystemTheme } from "@/composables";
// 明暗模式：应用入口初始化（挂 html.dark），不依赖 Layout 里的 header-theme 加载
import { useColorMode } from "@/composables";
useSystemTheme();
useColorMode();

</script>
