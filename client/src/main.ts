/*
 * =================================================================
 *  依赖安装
 * 说明:  请在 client 目录下运行此命令以安装必要的库。
 * =================================================================
 */

// npm install @kangc/v-md-editor@next date-fns -S

/*
 * =================================================================
 * (新增) 类型声明文件 (`client/src/types/`)
 * 说明: 新增此文件以解决 v-md-editor 的TypeScript类型报错问题。
 * =================================================================
 */

// --- 文件: client/src/types/v-md-editor.d.ts (新增) ---
// 这会告诉TypeScript，所有以.js结尾的模块导入都是有效的。
declare module '*.js'

/*
 * =================================================================
 * 1. 主配置文件 (`client/src/main.ts`)
 * 说明: 新增注册了Markdown预览组件。
 * =================================================================
 */

// --- 文件: client/src/main.ts ---
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// (已更新) 引入 Markdown 编辑器和预览器
import VMdEditor from '@kangc/v-md-editor/lib/base-editor';
import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';
import hljs from 'highlight.js';

import App from '@/App.vue';
import router from '@/router';
import api from '@/api';
import { useAuthStore } from '@/store/auth';
import { ElMessage } from 'element-plus';

import '@/assets/main.css';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);

// (已更新) 同时使用编辑器和预览器
VMdEditor.use(githubTheme, { Hljs: hljs });
VMdPreview.use(githubTheme, { Hljs: hljs });
app.use(VMdEditor);
app.use(VMdPreview);


// ----- 设置 Axios 拦截器 (保持不变) -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config.url === '/auth/login') {
        return Promise.reject(error);
    }
    const authStore = useAuthStore(pinia);
    if (error.response?.status === 401 || error.response?.status === 403) {
      ElMessage.error('认证已过期，请重新登录。');
      authStore.logout();
      router.push('/login');
    } else {
      ElMessage.error(error.response?.data?.message || '服务器发生错误');
    }
    return Promise.reject(error);
  }
);

app.mount('#app');
