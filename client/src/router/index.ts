/*
 * =================================================================
 * 路由 (`client/src/router/index.ts`)
 * 说明: 增加了“待办事项”页面的路由。
 * =================================================================
 */

// --- 文件: client/src/router/index.ts  ---
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import MainLayout from '@/layouts/MainLayout.vue';
import DashboardView from '@/views/DashboardView.vue';
import DataManagementView from '@/views/DataManagementView.vue';
import AboutView from '@/views/AboutView.vue';
import AnalysisView from '@/views/AnalysisView.vue';
import TodosView from '@/views/TodosView.vue'; // (新增)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView },
        { path: 'data-management', name: 'data-management', component: DataManagementView },
        { path: 'analysis', name: 'analysis', component: AnalysisView },
        { path: 'todos', name: 'todos', component: TodosView }, // (新增)
        { path: 'about', name: 'about', component: AboutView },
      ],
    },
  ],
});
// 路由守卫保持不变...
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    if (to.matched.some(record => record.meta.requiresAuth) && !token) {
        next({ name: 'login' });
    } else if (to.name === 'login' && token) {
        next({ name: 'dashboard' });
    } else {
        next();
    }
});
export default router;
