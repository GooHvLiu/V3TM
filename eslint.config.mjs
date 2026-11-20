import antfu from "@antfu/eslint-config";
import vueA11y from "eslint-plugin-vuejs-accessibility";

export default antfu({
  type: "app",
  vue: true,
  typescript: true,
  lessOpinionated: true,
  stylistic: false,
  formatters: false,
  jsonc: false,
  yaml: false,
  markdown: false,
  ignores: [
    "dist/**",
    "node_modules/**",
    "public/**",
    "docs/**",
    "components.d.ts",
    "src/assets/**",
    "*.md"
  ],
  rules: {
    "no-console": "off",
    "vue/multi-word-component-names": "off",
    "ts/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "unused-imports/no-unused-vars": "warn",
    "unused-imports/no-unused-imports": "off",
    "import/first": "off",
    "import/no-duplicates": "off",
    "import/consistent-type-specifier-style": "off",
    "perfectionist/sort-imports": "off",
    "perfectionist/sort-named-imports": "off",
    "perfectionist/sort-exports": "off",
    "vue/block-order": "off",
    "vue/define-macros-order": "off",
    "vue/html-indent": "off",
    // 模板里的文案多为 i18n 短标签，强制换行会把一行按钮拆成三行，阅读成本更高
    "vue/singleline-html-element-content-newline": "off",
    "vue/multiline-html-element-content-newline": "off",
    "vue/custom-event-name-casing": "off",
    "vue/eqeqeq": "off",
    "vue/no-useless-v-bind": "off",
    "vue/prefer-template": "off",
    "vue/no-unused-refs": "off",
    "vue/component-name-in-template-casing": "off",
    "eqeqeq": "off",
    "e18e/prefer-timer-args": "off",
    "regexp/no-super-linear-backtracking": "off",
    "regexp/negation": "off",
    "ts/no-use-before-define": "off",
    "ts/no-duplicate-enum-values": "off",
    "regexp/use-ignore-case": "off",
    "regexp/prefer-w": "off",
    "regexp/no-unused-capturing-group": "off",
    "no-throw-literal": "off",
    "prefer-template": "off",
    "unicode-bom": "off",
    "node/prefer-global/process": "off",
    "unicorn/prefer-node-protocol": "off",
    "style/semi": "off",
    "style/quotes": "off",
    "style/comma-dangle": "off",
    "style/max-len": "off"
  }
}, {
  // 无障碍规则：先以提示为主，结构性缺失用错误拦住
  files: ["**/*.vue"],
  plugins: { "vuejs-accessibility": vueA11y },
  rules: {
    "vuejs-accessibility/alt-text": "warn",
    "vuejs-accessibility/anchor-has-content": "warn",
    "vuejs-accessibility/form-control-has-label": "warn",
    "vuejs-accessibility/label-has-for": "warn",
    "vuejs-accessibility/no-autofocus": "warn",
    "vuejs-accessibility/no-static-element-interactions": "warn",
    "vuejs-accessibility/role-has-required-aria-props": "error"
  }
});
