import axios from "axios";
const baseUrl = import.meta.env.VITE_API_BASE_URL;

const instance = axios.create({
  baseURL:baseUrl,
  timeout:10000
})

// 请求拦截携带token
instance.interceptors.request.use(config=>{
  const token = localStorage.getItem("token");
  if(token){
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default instance;
