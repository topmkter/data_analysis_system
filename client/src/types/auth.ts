/*
 * =================================================================
 * 第三步: 创建类型定义
 * 说明: 在 src 目录下创建一个 types 文件夹，用于存放类型定义文件。
 * =================================================================
 */

// --- 文件: client/src/types/auth.ts (新增) ---
export interface LoginCredentials {
  username?: string;
  password?: string;
}
