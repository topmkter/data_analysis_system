/*
 * =================================================================
 * API 服务层 (`client/src/api/`)
 * 说明:为数据管理功能添加完整的CRUD API请求函数。
 * =================================================================
 */

// --- 文件: client/src/api/index.ts  ---
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export default api;
