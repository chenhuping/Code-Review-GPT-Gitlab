import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const username = ref('')

  // 从环境变量读取默认账号密码
  const DEFAULT_USERNAME = import.meta.env.VITE_DEFAULT_USERNAME
  const DEFAULT_PASSWORD = import.meta.env.VITE_DEFAULT_PASSWORD

  /**
   * 登录方法
   * @param user 用户名
   * @param pass 密码
   * @returns 登录是否成功
   */
  const login = (user: string, pass: string): boolean => {
    if (user === DEFAULT_USERNAME && pass === DEFAULT_PASSWORD) {
      // 生成简单的 token（base64 编码）
      const token = btoa(`${user}:${Date.now()}`)
      localStorage.setItem('auth_token', token)
      localStorage.setItem('username', user)
      isAuthenticated.value = true
      username.value = user
      return true
    }
    return false
  }

  /**
   * 登出方法
   */
  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
    isAuthenticated.value = false
    username.value = ''
  }

  /**
   * 检查登录状态
   * @returns 是否已登录
   */
  const checkAuth = (): boolean => {
    const token = localStorage.getItem('auth_token')
    const savedUsername = localStorage.getItem('username')
    if (token && savedUsername) {
      isAuthenticated.value = true
      username.value = savedUsername
      return true
    }
    return false
  }

  return {
    isAuthenticated,
    username,
    login,
    logout,
    checkAuth
  }
})
