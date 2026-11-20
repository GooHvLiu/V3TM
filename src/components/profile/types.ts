/** 资料面板的单行展示项，color 用于主题色块，code 用于等宽补充值 */
export interface ProfileInfoItem {
  label: string;
  value: string;
  mono?: boolean;
  color?: string;
  code?: string;
}

/** 账号动态项，key 只用于列表定位 */
export interface ProfileActivityItem {
  key: string;
  title: string;
  time: string;
}
