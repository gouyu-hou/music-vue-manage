import axios from "axios";
import router from "../router";
import { Message } from "element-ui";

const service = axios.create({
  // 🔥🔥🔥 【关键修改】：读取刚才定义的 API_HOST
  baseURL: process.env.API_HOST + "/music", 
  timeout: 5000,
  withCredentials: true,
});

// 请求拦截器 (通常保持不变)
service.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);

// 【核心修改】响应拦截器
service.interceptors.response.use(
  (response) => {
    // 如果后端返回 200 OK，但业务逻辑中包含未登录状态 (例如 code == 401)
    if (response.data.code === 401) {
      handleLoginExpire();
      return Promise.reject("登录过期");
    }

    // 正常返回 data 部分 (根据您之前的代码习惯，这里直接返回 data)
    return response.data;
  },
  (error) => {
    // 处理 HTTP 状态码错误 (例如后端 response.setStatus(401))
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 1. 提示用户
          Message.error("登录状态已失效，请重新登录");
          handleLoginExpire();
          break;
        case 403:
          Message.error("没有权限进行此操作");
          break;
        case 404:
          Message.error("请求的资源不存在");
          break;
        case 500:
          Message.error("服务器内部错误");
          break;
        default:
          Message.error("网络请求失败");
      }
    } else {
      Message.error("网络连接超时或异常");
      handleLoginExpire();
    }
    return Promise.reject(error);
  }
);

// 【新增】统一处理登录过期的方法
function handleLoginExpire() {
  // 2. 清除本地缓存
  localStorage.removeItem("user");
  localStorage.removeItem("username");

  // 3. 跳转回登录页
  // 使用 replace 防止用户点击“返回”按钮又回到需要权限的页面
  router.replace("/");
}

export default service;
