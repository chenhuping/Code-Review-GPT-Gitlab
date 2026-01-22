import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { API_CONFIG } from '@/config/api'
import router from '@/router'

const service: AxiosInstance = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加认证 token
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data, status } = response

    // 2xx 状态码都认为是成功
    if (status >= 200 && status < 300) {
      return data
    }

    alert(data.message || '请求失败')
    return Promise.reject(new Error(data.message || 'Error'))
  },
  (error) => {
    console.error('Response error:', error)

    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          // 未授权，清除登录状态并跳转到登录页
          localStorage.removeItem('auth_token')
          localStorage.removeItem('username')
          router.push('/login')
          alert('登录已过期，请重新登录')
          break
        case 403:
          alert('拒绝访问')
          break
        case 404:
          alert('请求地址不存在')
          break
        case 500:
          alert('服务器内部错误')
          break
        default:
          alert(error.response.data?.message || '请求失败')
      }
    } else {
      alert('网络连接失败')
    }

    return Promise.reject(error)
  }
)

export default service
