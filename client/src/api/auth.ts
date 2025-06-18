// --- 文件: client/src/api/auth.ts ---
import api from '@/api' // 使用别名
import type { LoginCredentials } from '@/types/auth'

export const loginAPI = (credentials: LoginCredentials) => {
  return api.post('/auth/login', credentials)
}
