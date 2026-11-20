# 原子组件总览

十四个自封装组件只做一件事：把 Element Plus 的原生控件收拢到一套语义色、一套尺寸、一套间距上。业务页面里写 `tone="danger"` 而不是查色板，写 `variant="outline"` 而不是记 `plain / text / link` 的差别。

<div class="demo-grid">

<div class="demo-cell">
  <span class="demo-cell-label">AppButton</span>
  <span>按钮：四种视觉层级、六档语义色、权限码内置</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTag</span>
  <span>标签：软底 / 描边 / 实心，可带状态点</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTooltip</span>
  <span>文字提示：全站浅底，长文本默认限宽 320</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppAlert</span>
  <span>提醒：边框跟随语义色，正文层级压平</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppCard</span>
  <span>卡片：标题与操作区一行排布，内边距五档</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppAvatar</span>
  <span>头像：语义尺寸与语义色</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppBadge</span>
  <span>徽标：数字与圆点两套尺寸</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppDialog</span>
  <span>对话框：v-model 受控，底部按钮可省</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppDrawer</span>
  <span>抽屉：v-model 受控，默认保留内容状态</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTabs</span>
  <span>页签：数据驱动，标签可带图标与计数</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppSeparator</span>
  <span>分隔：三档间距，横竖两向</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppEmpty</span>
  <span>空态：文案可空，动作区独立</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppSkeleton</span>
  <span>骨架：文本 / 列表 / 表格 / 页面 / 图表五型</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppErrorState</span>
  <span>错误态：标题、说明、错误码、重试与返回</span>
</div>

</div>

## 三条共同约定

**语义色优先。** 新代码传 `tone`，旧的 `type`、`plain`、`text`、`link`、`effect` 仍然接受，内部折算到同一套档位，所以迁移可以分批做。

**尺寸统一走 `ControlSize`。** `sm / default / lg` 三档，映射到 Element Plus 的 `small / default / large`；需要像素值时直接传数字。

**默认文案不硬编码。** 组件里的「确认 / 取消 / 重试 / 暂无数据」取自语言包 `common.*`，取不到时回退中文包，因此单测和文档站不挂 i18n 也能渲染。

## 不封装的边界

Element Plus 已覆盖的 29 类控件不再套一层壳：`el-table`、`el-form`、`el-select`、`el-date-picker`、`el-tree`、`el-cascader` 等直接使用。薄包装只会让 props 透传多一层、调试多一跳，收益为零。真正需要加厚的是三个复合件——ProTable、ProForm、ProSearch，它们承载的是列偏好、字段编排、查询折叠这类跨页面逻辑。
