import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

// 请求拦截：自动携带 token
instance.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// 响应拦截：401 统一清理登录态，避免各页面重复处理
instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!location.pathname.startsWith("/login")) location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default instance;

// 便捷方法：取出后端返回的 msg
export function errMsg(e: unknown, fallback: string) {
  const msg = (e as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return msg || fallback;
}
