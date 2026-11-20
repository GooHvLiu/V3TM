/** 验证码 */
export interface CaptchaInfo {
  captchaId?: string;
  img?: string;
  expiresIn?: number;
  devCode?: string;
}
