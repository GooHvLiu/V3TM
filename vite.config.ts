import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import fs from "node:fs";
import path from "path";
// unplugin-icons：图标按需编译
import Icons from "unplugin-icons/vite";
// IconsResolver：让 <i-ep-xxx /> <i-custom-xxx /> 自动解析
import IconsResolver from "unplugin-icons/resolver";
// unplugin-vue-components：组件自动导入（ElementPlusResolver 与 IconsResolver 的宿主）
import Components from "unplugin-vue-components/vite";
// ElementPlusResolver：Element Plus 组件与指令按需引入
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// FileSystemIconLoader：读取本地 svg 目录做自定义图标集
import { FileSystemIconLoader } from "unplugin-icons/loaders";
// 模板里仍以裸图标名使用 Element Plus 图标，这里按导出名精确匹配
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const elementPlusComponents = path.resolve(import.meta.dirname, "node_modules/element-plus/es/components");
const elementPlusStyles = fs
  .readdirSync(elementPlusComponents, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && fs.existsSync(path.join(elementPlusComponents, entry.name, "style/css.mjs"))
  )
  .map((entry) => `element-plus/es/components/${entry.name}/style/css`);

const elementPlusIconNames = new Set(Object.keys(ElementPlusIconsVue));

/** 裸图标名按需解析：只命中真实导出，避免误伤业务组件 */
const elementPlusIconResolver = (name: string) => {
  if (!elementPlusIconNames.has(name)) return;
  return { name, from: "@element-plus/icons-vue" };
};

// defineConfig 采用函数写法，可以拿到 mode 和 command
export default defineConfig(({ mode }) => {
  // 在这里加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  // 提示性说明文字
  console.log("Current Mode:", mode);
  console.log("Server IP:", env.VITE_APP_PROXY_TARGET);

  return {
    // 静态托管可挂到子路径；本地开发与默认构建保持根路径
    base: env.VITE_APP_BASE || "/",
    plugins: [
      vue(),
      // 组件自动导入：Element Plus 与图标按需解析
      Components({
        resolvers: [
          ElementPlusResolver({ importStyle: "css" }),
          elementPlusIconResolver,
          IconsResolver({
            prefix: "i",
            // 自定义集合名（与下方 Icons 插件的 customCollections 键一致，resolver 才能拆分 i-custom-*）
            customCollections: ["custom"]
          })
        ]
      }),
      // 图标编译插件
      Icons({
        compiler: "vue3",
        // 自定义图标集：读取本地 src/assets/custom-icons 下的 svg
        customCollections: {
          custom: FileSystemIconLoader(
            path.resolve(import.meta.dirname, "src/assets/custom-icons"),
            // 通用清洗管道：任意 svg 丢进目录即自动处理，无需手工转换
            (svg) =>
              svg
                // ① 删 XML 声明与 DOCTYPE（Vue 模板不认，必删）
                .replace(/^<\?xml[^>]*\?>/g, "")
                .replace(/<!DOCTYPE[^>]*>/g, "")
                // ② 根 svg 标签瘦身：只留 xmlns + viewBox（自动捕获，兼容任意图形） 去除自身控制尺寸的数据，统一由外包层 Size 控制
                .replace(/<svg[^>]*viewBox="([^"]+)"[^>]*>/g, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$1">')
                // ③ fill 属性 → style 形式：保住彩色（不走 currentColor 单色化）
                .replace(/fill="([^"]+)"/g, 'style="fill:$1"')
          )
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src")
      }
    },
    server: {
      proxy: {
        // 用环境变量 VITE_APP_BASE_API 作为代理匹配前缀
        [env.VITE_APP_BASE_API]: {
          // env 文件中的 VITE_APP_PROXY_TARGET 字段
          target: env.VITE_APP_PROXY_TARGET,
          // 开启跨域
          changeOrigin: true
        }
      }
    },
    // 配置应用预处理 Less
    css: {
      preprocessorOptions: {
        less: {
          additionalData: `@import "@/assets/styles/variables/variables.less";`
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          // 第三方依赖按层拆包：入口只留业务代码，重依赖独立缓存
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;
            if (id.includes("/vditor/")) return "vditor";
            // 图表只在看板等少数页面出现，单独成块，不被入口的静态依赖带进首屏
            if (id.includes("/echarts/") || id.includes("/zrender/")) return "charts";
            if (id.includes("/axios/") || id.includes("follow-redirects")) return "http";
            if (
              id.includes("/vue/") ||
              id.includes("@vue/") ||
              id.includes("vue-router") ||
              id.includes("pinia") ||
              id.includes("vue-i18n") ||
              id.includes("@intlify/")
            ) {
              return "vue-vendor";
            }
            if (id.includes("element-plus") || id.includes("@element-plus/icons-vue")) return;
            return "vendor";
          }
        }
      }
    },
    // 把 Element Plus 各组件的 `style/css` 入口在启动时一起预打包，避免运行中首次进入某个页面才发现新依赖、再整页 reload
    optimizeDeps: {
      include: ["element-plus/es", "@element-plus/icons-vue", ...elementPlusStyles]
    }
  };
});
