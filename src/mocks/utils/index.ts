/**
 * Mock 请求体解析
 * axios transformRequest 会把对象 data 序列化为 JSON 字符串，
 * 统一反序列化回对象（与真实后端接收 JSON body 语义一致）
 */

export const parseBody = <T>(config: { data?: unknown }): T => {
  const data = config.data;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as T;
    } catch {
      return {} as T;
    }
  }
  return (data ?? {}) as T;
};

/**
 * Mock 业务错误
 * 携带 mockCode 抛出，由请求适配器还原成业务响应壳，
 * 状态码按业务码映射，从而走响应拦截器的失败分支
 */
export const mockError = (
  code: number,
  message: string,
  params?: Record<string, string | number | boolean>
): Error => Object.assign(new Error(message), { mockCode: code, mockParams: params });
