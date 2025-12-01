import axios from 'axios'
import router from "@/router";
import qs from "qs"
axios.defaults.withCredentials = true //让ajax请求携带cookie
// 创建请求对象
const request = axios.create({
    baseURL: 'http://localhost:8085/music/', // 注意！！ 这里是全局统一加上了 baseURL 前缀，
    timeout: 5000
})
// response 拦截器
// 可以在接口响应后统一处理结果
request.interceptors.response.use(
    response => {
        let res = response.data;
        // 如果是返回的文件
        if (response.config.responseType === 'blob') {
            return res
        }
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        return res;
    },
    error => {
        console.log('err' + error) // for debug
        return Promise.reject(error)
    }
)
export default request