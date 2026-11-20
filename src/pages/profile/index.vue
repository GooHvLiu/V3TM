<template>
  <div class="page-wrap-profile">
    <BasicPage :title="t('profile.title')" :description="t('profile.description')">
      <template #actions>
        <app-button tone="primary" @click="passwordDialogVisible = true">
          {{ t("profile.action.changePassword") }}
        </app-button>
        <app-button variant="outline" @click="handleLogout">
          {{ t("profile.action.logout") }}
        </app-button>
      </template>

      <template #content>
        <div class="profile-body">
          <ProfileIdentityCard
            :profile="profile"
            :display-name="displayName"
            :role-label="roleLabel"
            :status-text="statusText"
            :status-tag-type="statusTagType"
            :role-count="roleCount"
            :last-login-text="lastLoginText"
          />

          <ProfileInfoPanel
            :title="t('profile.section.info')"
            :items="accountItems"
          />

          <div class="lower">
            <ProfileInfoPanel
              :title="t('profile.section.preference')"
              :note="t('profile.preference.readonly')"
              :items="preferenceItems"
              single
            />
            <ProfileActivityTimeline :items="activities" />
          </div>
        </div>
      </template>
    </BasicPage>

    <!-- 改密复用强制改密表单：同一套校验规则与错误码分发 -->
    <app-dialog
      v-model="passwordDialogVisible"
      :title="t('profile.dialog.title')"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="!submitting"
      :show-close="!submitting"
    >
      <ForcePasswordForm
        v-if="passwordDialogVisible"
        ref="passwordFormRef"
        hide-submit
        :loading="submitting"
        @submit="submitPassword"
      />
      <template #footer>
        <app-button :disabled="submitting" variant="outline" @click="passwordDialogVisible = false">
          {{ t("common.cancel") }}
        </app-button>
        <app-button tone="primary" :loading="submitting" @click="passwordFormRef?.submit()">
          {{ t("common.confirm") }}
        </app-button>
      </template>
    </app-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "Profile" });

import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { ElMessage } from "@/utils/element-plus";

import BasicPage from "@/components/page/basic/index.vue";
import ForcePasswordForm from "@/components/auth/force-password/form/index.vue";
import ProfileIdentityCard from "@/components/profile/identity-card/index.vue";
import ProfileInfoPanel from "@/components/profile/info-panel/index.vue";
import ProfileActivityTimeline from "@/components/profile/activity-timeline/index.vue";
import type { ProfileActivityItem, ProfileInfoItem } from "@/components/profile/types";

import { changePassword } from "@/api";
import { useUserStore, useMenuStore, useThemeStore } from "@/stores";
import { AUTH, LOCALES, THEME_PRIMARY_COLORS } from "@/constants";
import { formatDate } from "@/utils";
import type { PublicRequestError } from "@/types";

const { t, locale } = useI18n();
const router = useRouter();
const userStore = useUserStore();
const menuStore = useMenuStore();
const themeStore = useThemeStore();

/** 当前登录用户资料：页面所有账号数据只认这一份 */
const profile = computed(() => userStore.userProfile);

const displayName = computed(() => profile.value?.realName || profile.value?.username || "?");

/** 角色显示名：后端返回中文名，取不到时回退角色编码 */
const roleLabel = computed(() => {
  const role = profile.value?.roles?.[0];
  return role ? t(role.name) : profile.value?.role ?? "";
});

const roleCount = computed(() => profile.value?.roles?.length ?? 0);

const statusText = computed(() => {
  const status = profile.value?.status;
  if (status === 0) return t("profile.status.disabled");
  if (status === 2) return t("profile.status.pending");
  return t("profile.status.enabled");
});

const statusTagType = computed<"success" | "info" | "warning">(() => {
  const status = profile.value?.status;
  if (status === 0) return "info";
  if (status === 2) return "warning";
  return "success";
});

/** 注册时间缺失按 - 处理；最后登录缺失是「从未登录」，两种空值语义不同 */
const createdAtText = computed(() => formatDate(profile.value?.createdAt, "YYYY-MM-DD HH:mm") || "-");
const lastLoginText = computed(
  () => formatDate(profile.value?.lastLoginAt ?? undefined, "YYYY-MM-DD HH:mm") || t("profile.neverLoggedIn")
);

const localeLabel = computed(() =>
  locale.value === LOCALES.EN_US ? t("profile.preference.en") : t("profile.preference.zh")
);

const themeColor = computed(
  () => THEME_PRIMARY_COLORS.find((item) => item.theme === themeStore.customizeTheme)?.primaryColor ?? ""
);

const accountItems = computed<ProfileInfoItem[]>(() => {
  const role = [roleLabel.value, profile.value?.role].filter(Boolean).join(" · ") || "-";
  return [
    { label: t("profile.field.id"), value: String(profile.value?.id ?? "-"), mono: true },
    { label: t("profile.field.username"), value: profile.value?.username || "-", mono: true },
    { label: t("profile.field.realName"), value: profile.value?.realName || "-" },
    { label: t("profile.field.email"), value: profile.value?.email || "-" },
    { label: t("profile.field.role"), value: role },
    { label: t("profile.field.status"), value: statusText.value },
    { label: t("profile.field.createdAt"), value: createdAtText.value },
    { label: t("profile.field.lastLoginAt"), value: lastLoginText.value }
  ];
});

const preferenceItems = computed<ProfileInfoItem[]>(() => [
  { label: t("profile.preference.language"), value: localeLabel.value },
  {
    label: t("profile.preference.theme"),
    value: themeStore.customizeTheme,
    color: themeColor.value || undefined,
    code: themeColor.value || undefined
  }
]);

/** 动态按时间倒序：登录在前，账号创建在后；无对应字段就不出这一条 */
const activities = computed<ProfileActivityItem[]>(() => {
  const list: ProfileActivityItem[] = [];
  const loginAt = formatDate(profile.value?.lastLoginAt ?? undefined, "YYYY-MM-DD HH:mm");
  const created = formatDate(profile.value?.createdAt, "YYYY-MM-DD HH:mm");
  if (loginAt) list.push({ key: "login", title: t("profile.activity.login"), time: loginAt });
  if (created) list.push({ key: "created", title: t("profile.activity.created"), time: created });
  return list;
});

// 修改密码
const passwordDialogVisible = ref(false);
const passwordFormRef = ref<InstanceType<typeof ForcePasswordForm> | null>(null);
const submitting = ref(false);

const submitPassword = async (payload: { oldPassword: string; newPassword: string }): Promise<void> => {
  submitting.value = true;
  try {
    await changePassword(payload);
    passwordDialogVisible.value = false;
    // 后端改密后吊销全部凭证，本地一并清空再回登录页
    userStore.clearSession();
    menuStore.setMenus([]);
    ElMessage.success(t("profile.message.passwordChanged"));
    router.replace({ path: `${AUTH.ROOT}/${AUTH.LOGIN}` });
  } catch (error) {
    // 拦截器已带业务码，按码把焦点送回对应输入框
    const err = error as PublicRequestError;
    switch (err.code) {
      case 20003:
        ElMessage.error(t("auth.force.errors.oldWrong"));
        passwordFormRef.value?.focusOld();
        break;
      case 20014:
        ElMessage.error(t("auth.force.errors.sameAsOld"));
        passwordFormRef.value?.focusNew();
        break;
      case 20005:
        ElMessage.error(t("auth.force.errors.passwordWeak"));
        passwordFormRef.value?.focusNew();
        break;
      case 10003:
        // 参数非法：后端在 params.field 指明字段
        if (err.params?.field === "oldPassword") {
          ElMessage.error(t("auth.force.errors.oldWrong"));
          passwordFormRef.value?.focusOld();
        } else {
          ElMessage.error(t("auth.force.errors.unknown"));
        }
        break;
      default:
        ElMessage.error(t("auth.force.errors.unknown"));
    }
  } finally {
    submitting.value = false;
  }
};

const handleLogout = async (): Promise<void> => {
  await userStore.logout();
  menuStore.setMenus([]);
  router.push(`${AUTH.ROOT}/${AUTH.LOGIN}`);
};

// 本地缓存的 profile 可能是旧版、没有时间字段，进页面重新拉一次
onMounted(() => {
  userStore.fetchProfile().catch(() => undefined);
});
</script>

<style scoped lang="less">
.page-wrap-profile {
  .profile-body {
    display: flex;
    flex-direction: column;
    gap: @space-4;
  }

  .lower {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: @space-5;
    align-items: start;
  }

  @media (max-width: @screen-lg) {
    .lower {
      grid-template-columns: minmax(0, 1fr);
    }
  }
}
</style>
