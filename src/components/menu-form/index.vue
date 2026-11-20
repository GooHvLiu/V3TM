<template>
  <app-drawer
    v-model="visible"
    :title="mode === 'create' ? t('menuCenter.form.createTitle') : t('menuCenter.form.editTitle')"
    size="520px"
    :close-on-click-modal="false"
    destroy-on-close
  >    <el-form
      :model="form"
      :label-width="isMobile ? '0px' : '96px'"
      :label-position="isMobile ? 'top' : 'right'"
      class="menu-form"
    >
      <section class="menu-form-section">
        <p class="menu-form-section-title">{{ t("menuCenter.form.sectionBasic") }}</p>

        <!-- 类型：切换即重置不适用字段，不等提交才报错 -->
        <el-form-item :label="t('menuCenter.form.type')" required>
          <el-radio-group :model-value="form.type" @change="handleTypeChange">
            <el-radio-button v-for="option in MENU_TYPE_OPTIONS" :key="option.value" :value="option.value">
              {{ t(option.labelKey) }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <app-alert
          v-if="form.type === 'BUTTON'"
          tone="info"
          :title="t('menuCenter.form.buttonTip')"
        />

        <el-form-item :label="t('menuCenter.form.parent')" :error="errors.parentId" :required="form.type === 'BUTTON'">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="treeSelectProps"
            node-key="id"
            check-strictly
            default-expand-all
            :empty-values="[undefined, null]"
            class="menu-form-control"
          />
        </el-form-item>

        <el-form-item :label="t('menuCenter.form.name')" :error="errors.name" required>
          <div class="menu-form-field">
            <el-input v-model="form.name" maxlength="50" show-word-limit />
            <p class="menu-form-tip">{{ t("menuCenter.form.nameTip") }}</p>
          </div>
        </el-form-item>

        <!-- 外链开关只对 MENU 有意义 -->
        <el-form-item v-if="form.type === 'MENU'" :label="t('menuCenter.form.external')">
          <el-switch v-model="form.external" @change="handleExternalChange" />
          <span class="menu-form-inline-tip">{{ t("menuCenter.form.externalTip") }}</span>
        </el-form-item>
      </section>

      <section class="menu-form-section">
        <p class="menu-form-section-title">{{ t("menuCenter.form.sectionRoute") }}</p>

        <el-form-item v-if="form.type !== 'BUTTON'" :label="t('menuCenter.form.path')" :error="errors.path" required>
          <div class="menu-form-field">
            <el-input
              v-model="form.path"
              maxlength="200"
              :placeholder="
                form.external ? t('menuCenter.form.pathExternalPlaceholder') : t('menuCenter.form.pathPlaceholder')
              "
            />
            <p class="menu-form-tip">{{ t("menuCenter.form.pathTip") }}</p>
          </div>
        </el-form-item>

        <el-form-item
          v-if="form.type === 'MENU' && !form.external"
          :label="t('menuCenter.form.component')"
          :error="errors.component"
          required
        >
          <div class="menu-form-field">
            <el-input v-model="form.component" :placeholder="t('menuCenter.form.componentPlaceholder')" />
            <p class="menu-form-tip">{{ t("menuCenter.form.componentTip") }}</p>
          </div>
        </el-form-item>

        <el-form-item
          :label="t('menuCenter.form.permission')"
          :error="errors.permission"
          :required="form.type !== 'DIR'"
        >
          <div class="menu-form-field">
            <el-input
              v-model="form.permission"
              maxlength="100"
              :placeholder="t('menuCenter.form.permissionPlaceholder')"
            />
            <p class="menu-form-tip">{{ t("menuCenter.form.permissionTip") }}</p>
          </div>
        </el-form-item>
      </section>

      <section class="menu-form-section">
        <p class="menu-form-section-title">{{ t("menuCenter.form.sectionDisplay") }}</p>

        <el-form-item v-if="form.type !== 'BUTTON'" :label="t('menuCenter.form.icon')">
          <div class="menu-form-field">
            <el-input v-model="form.icon" :placeholder="t('menuCenter.form.iconPlaceholder')" />
            <p class="menu-form-tip">{{ t("menuCenter.form.iconTip") }}</p>
          </div>
        </el-form-item>

        <!-- 分组只对顶层 DIR/MENU 生效 -->
        <el-form-item v-if="form.type !== 'BUTTON' && form.parentId === 0" :label="t('menuCenter.form.group')">
          <div class="menu-form-field">
            <el-select v-model="form.menuGroup" clearable class="menu-form-control">
              <el-option
                v-for="option in MENU_GROUP_OPTIONS"
                :key="option.value"
                :label="t(option.labelKey)"
                :value="option.value"
              />
            </el-select>
            <p class="menu-form-tip">{{ t("menuCenter.form.groupTip") }}</p>
          </div>
        </el-form-item>

        <el-form-item :label="t('menuCenter.form.sort')">
          <el-input-number v-model="form.sort" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>

        <el-form-item :label="t('menuCenter.form.status')">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>

        <el-form-item :label="t('menuCenter.form.visible')">
          <div class="menu-form-field">
            <el-switch
              v-model="form.visible"
              :active-value="1"
              :inactive-value="0"
              :disabled="form.type === 'BUTTON'"
            />
            <p v-if="form.type === 'BUTTON'" class="menu-form-tip">{{ t("menuCenter.form.visibleFixed") }}</p>
          </div>
        </el-form-item>
      </section>
    </el-form>

    <template #footer>
      <div class="menu-form-footer">
        <app-button variant="outline" @click="visible = false">{{ t("common.cancel") }}</app-button>
        <app-button tone="primary" :loading="submitting" @click="handleSubmit">
          {{ submitting ? t("menuCenter.form.saving") : t("menuCenter.form.save") }}
        </app-button>
      </div>
    </template>
  </app-drawer>
</template>

<script setup lang="ts">
defineOptions({ name: "MenuForm" });

import { computed, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "@/utils/element-plus";
import { createMenu, updateMenu } from "@/api";
import type { MenuEditableFields, MenuFormPayload, MenuTreeNode, MenuType, PublicRequestError } from "@/types";
import { useBreakpoint } from "@/composables";
import { buildMenuValidator } from "@/pages/super-admin/menu-center/validators/menu.validator";
import {
  MENU_GROUP_OPTIONS,
  MENU_TYPE_OPTIONS,
  findMenuNode,
  isExternalPath,
  menuNameOf,
  walkMenu
} from "@/pages/super-admin/menu-center/status";
import { zodToErrors } from "@/utils";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    mode: "create" | "edit";
    menu?: MenuEditableFields | null;
    tree: MenuTreeNode[];
    parentId?: number;
  }>(),
  { menu: null, parentId: 0 }
);

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  success: [];
}>();

const { t } = useI18n();
const { isMobile } = useBreakpoint();

/** 抽屉显隐走 v-model 受控：父组件只改 prop，子组件只 emit */
const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value)
});

interface MenuFormModel {
  parentId: number;
  name: string;
  type: MenuType;
  path: string;
  component: string;
  permission: string;
  icon: string;
  menuGroup: string;
  sort: number;
  status: 0 | 1;
  visible: 0 | 1;
  external: boolean;
}

const form = reactive<MenuFormModel>({
  parentId: 0,
  name: "",
  type: "MENU",
  path: "",
  component: "",
  permission: "",
  icon: "",
  menuGroup: "",
  sort: 0,
  status: 1,
  visible: 1,
  external: false
});

const errors = ref<Record<string, string>>({});
const submitting = ref(false);

const treeSelectProps = { label: "label", children: "children", disabled: "disabled" };

/** 编辑时禁用「自己 + 自己的子孙」，后端也有循环校验，双重兜底 */
const subtreeIds = computed<number[]>(() => {
  if (props.mode !== "edit" || !props.menu) return [];
  const target = findMenuNode(props.tree, props.menu.id);
  if (!target) return [];
  const ids: number[] = [];
  walkMenu([target], (node) => ids.push(node.id));
  return ids;
});

interface ParentOption {
  id: number;
  label: string;
  disabled?: boolean;
  children?: ParentOption[];
}

const parentOptions = computed<ParentOption[]>(() => {
  const build = (nodes: MenuTreeNode[]): ParentOption[] =>
    nodes
      .filter((node) => node.type !== "BUTTON")
      .map((node) => ({
        id: node.id,
        label: menuNameOf(node.name),
        disabled: subtreeIds.value.includes(node.id),
        children: build(node.children ?? [])
      }));
  return [{ id: 0, label: t("menuCenter.form.root"), children: build(props.tree) }];
});

const hydrate = (): void => {
  errors.value = {};
  const source = props.menu;
  if (props.mode === "edit" && source) {
    Object.assign(form, {
      parentId: source.parentId,
      name: source.name,
      type: source.type,
      path: source.path ?? "",
      component: source.component ?? "",
      permission: source.permission ?? "",
      icon: source.icon ?? "",
      menuGroup: source.menu_group ?? "",
      sort: source.sort,
      status: source.status,
      visible: source.visible,
      external: isExternalPath(source.path ?? "")
    });
    return;
  }
  Object.assign(form, {
    parentId: props.parentId,
    name: "",
    type: "MENU",
    path: "",
    component: "",
    permission: "",
    icon: "",
    menuGroup: "",
    sort: 0,
    status: 1,
    visible: 1,
    external: false
  });
};

watch(
  () => props.modelValue,
  (open) => {
    if (open) hydrate();
  }
);

const handleTypeChange = (value: string | number | boolean | undefined): void => {
  const next = String(value) as MenuType;
  form.type = next;
  if (next === "BUTTON") {
    Object.assign(form, { path: "", component: "", icon: "", menuGroup: "", visible: 0, external: false });
  } else {
    if (form.visible === 0) form.visible = 1;
    if (next === "DIR") {
      form.component = "";
      form.external = false;
    }
  }
  errors.value = {};
};

const handleExternalChange = (value: boolean | string | number): void => {
  if (value) form.component = "";
  errors.value = {};
};

/** 与后端同规则的本地预检：字段格式与重名都走同一份 zod schema */
const validate = (): boolean => {
  const schema = buildMenuValidator({
    tree: props.tree,
    mode: props.mode,
    selfId: props.mode === "edit" ? props.menu?.id : undefined
  });
  errors.value = zodToErrors(schema, { ...form }, t);
  return Object.keys(errors.value).length === 0;
};

const buildPayload = (): MenuFormPayload => ({
  parentId: form.parentId,
  name: form.name.trim(),
  type: form.type,
  path: form.type === "BUTTON" ? "" : form.path.trim(),
  component: form.type === "BUTTON" || form.external ? "" : form.component.trim(),
  permission: form.permission.trim(),
  icon: form.type === "BUTTON" ? "" : form.icon.trim(),
  // 分组只对顶层 DIR/MENU 生效，子级与按钮统一留空
  menu_group: form.type !== "BUTTON" && form.parentId === 0 ? form.menuGroup : "",
  sort: form.sort,
  status: form.status,
  visible: form.type === "BUTTON" ? 0 : form.visible
});

/** 服务端错误 → 表单字段：参数非法看 params.field，重名类看 msg 标识 */
const applyServerError = (error: PublicRequestError): void => {
  const field = String(error.params?.field ?? "");
  if (field) {
    errors.value = { [field]: t("menuCenter.form.invalidField", { field: t(`field.${field}`) }) };
    return;
  }
  const message = error.msg ?? "";
  if (message === "MENU_EXIST") {
    errors.value = { name: t("error.MENU_EXIST") };
    return;
  }
  if (message === "MENU_PATH_EXIST") {
    errors.value = { path: t("error.MENU_PATH_EXIST") };
    return;
  }
  if (message === "MENU_PERMISSION_EXIST") {
    errors.value = { permission: t("error.MENU_PERMISSION_EXIST") };
    return;
  }
  if (message === "MENU_PARENT_DELETED") {
    errors.value = { parentId: t("error.MENU_PARENT_DELETED") };
    return;
  }
  ElMessage.error(t("menuCenter.form.saveFailed"));
};

const handleSubmit = async (): Promise<void> => {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload = buildPayload();
    if (props.mode === "create") {
      await createMenu(payload);
      ElMessage.success(t("menuCenter.form.createDone"));
    } else if (props.menu) {
      await updateMenu(props.menu.id, payload);
      ElMessage.success(t("menuCenter.form.updateDone"));
    }
    emit("success");
    visible.value = false;
  } catch (error) {
    applyServerError(error as PublicRequestError);
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped lang="less">
.menu-form {
  padding-right: @space-2-5;
  .menu-form-section {
    padding-bottom: @space-1-5;
    &:not(:last-child) {
      margin-bottom: @space-4;
      border-bottom: 1px dashed @color-border-lighter;
    }
  }
  // 分区标题：左侧短竖条 + 序号感，长表单里能一眼分段
  .menu-form-section-title {
    display: flex;
    align-items: center;
    gap: @space-2;
    color: @color-text-primary;
    font-size: 0.82rem;
    font-weight: 600;
    margin-bottom: @space-3;
    &::before {
      content: "";
      width: 3px;
      height: 12px;
      border-radius: @radius-sm;
      background: @color-primary;
    }
  }
  .menu-form-section :deep(.el-alert) {
    margin-bottom: @space-4;
  }
  .menu-form-field {
    width: 100%;
  }
  .menu-form-control {
    width: 100%;
  }
  .menu-form-tip {
    color: @color-text-secondary;
    font-size: 0.78rem;
    line-height: 1.5;
    margin-top: @space-1;
  }
  .menu-form-inline-tip {
    color: @color-text-secondary;
    font-size: 0.78rem;
    margin-left: @space-2-5;
  }

  @media (max-width: @screen-sm) {
    .menu-form {
      padding-right: 0;
    }

    .menu-form-inline-tip {
      display: block;
      margin-top: @space-1;
      margin-left: 0;
    }
  }
}
.menu-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: @space-2;
}
</style>
