/*
 * =================================================================
 * API 服务层 (`client/src/api/`)
 * 说明: 新增 todos.ts 文件，用于直接与Rust服务通信。
 * =================================================================
 */

// --- 文件: client/src/api/rustApi.ts  ---
import axios from 'axios';
import { ElMessage } from 'element-plus';

const rustApi = axios.create({
  baseURL: 'http://localhost:8080', // 直接指向Rust服务
});

rustApi.interceptors.response.use(
  response => response,
  error => {
    ElMessage.error(error.response?.data?.error || '与待办事项服务通信失败');
    return Promise.reject(error);
  }
);

export default rustApi;
