# Atom components overview

The fourteen wrappers here do one thing: pull Element Plus's native controls onto one semantic palette, one set of sizes and one spacing rhythm. Pages write `tone="danger"` instead of reaching for a colour, and `variant="outline"` instead of remembering how `plain`, `text` and `link` differ.

<div class="demo-grid">

<div class="demo-cell">
  <span class="demo-cell-label">AppButton</span>
  <span>Four visual levels, six semantic tones, permission codes built in</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTag</span>
  <span>Soft, outlined or solid fills, with an optional status dot</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTooltip</span>
  <span>Light surface everywhere; long text capped at 320 wide</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppAlert</span>
  <span>Border follows the tone; body text sits one level below the title</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppCard</span>
  <span>Title and actions on one line, five padding steps</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppAvatar</span>
  <span>Semantic sizes and tones</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppBadge</span>
  <span>Number and dot variants, two sizes</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppDialog</span>
  <span>Controlled by v-model, footer buttons optional</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppDrawer</span>
  <span>Controlled by v-model, content state kept by default</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppTabs</span>
  <span>Data driven; labels carry icons and counts</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppSeparator</span>
  <span>Three spacing steps, horizontal or vertical</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppEmpty</span>
  <span>Copy optional, actions in their own slot</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppSkeleton</span>
  <span>Text, list, table, page and chart shapes</span>
</div>

<div class="demo-cell">
  <span class="demo-cell-label">AppErrorState</span>
  <span>Title, message, error code, retry and back</span>
</div>

</div>

## Three shared conventions

**Semantic tones first.** New code passes `tone`. The older `type`, `plain`, `text`, `link` and `effect` props are still accepted and mapped onto the same steps internally, so a migration can happen piece by piece.

**Sizes go through `ControlSize`.** `sm`, `default` and `lg` map onto Element Plus's `small`, `default` and `large`; pass a number when you need a pixel value.

**Default copy is never hard-coded.** "Confirm", "Cancel", "Retry" and "No data" come from the `common.*` keys in the language packs, falling back to the Chinese pack, so unit tests and the docs site render without i18n wired up.

## Where wrapping stops

The 29 control types Element Plus already covers get no extra shell: `el-table`, `el-form`, `el-select`, `el-date-picker`, `el-tree`, `el-cascader` and the rest are used directly. A thin wrapper only adds a prop pass-through layer and one more hop when debugging, for no gain. The three composites that do need weight are ProTable, ProForm and ProSearch — they carry cross-page logic such as column preferences, field arrangement and collapsible filters.
