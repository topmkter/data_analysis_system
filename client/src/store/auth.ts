/*
 * =================================================================
 * 创建状态管理 (Pinia)
 * 说明: 统一使用 @ 别名路径。
 * =================================================================
 */

// --- 文件: client/src/store/auth.ts ---
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loginAPI } from '@/api/auth'
import type { LoginCredentials } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials: LoginCredentials) {
    const response = await loginAPI(credentials)
    const { user: userData, token: userToken } = response.data

    user.value = userData
    token.value = userToken

    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, login, logout }
})
