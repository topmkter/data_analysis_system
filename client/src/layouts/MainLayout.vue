/*
 * =================================================================
 * 主布局 (`client/src/layouts/MainLayout.vue`)
 * 说明: 恢复了页脚链接并启用了待办事项菜单。
 * =================================================================
 */
// --- 文件: client/src/layouts/MainLayout.vue  ---
<template>
  <el-container class="main-layout">
    <el-aside :width="sidebarWidth + 'px'" class="sidebar-container">
      <div class="logo">
        <span v-if="!isSidebarCollapsed">Edu-Analysis</span>
        <span v-else>EA</span>
      </div>
      <el-menu
        :default-active="router.currentRoute.value.path"
        class="el-menu-vertical-demo"
        router
        :collapse="isSidebarCollapsed"
        :collapse-transition="false"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>
            <span>个人主页</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/data-management">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>
            <span>数据管理</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/analysis">
          <el-icon><PieChart /></el-icon>
          <template #title>
            <span>可视化分析</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/todos">
          <el-icon><Memo /></el-icon>
          <template #title>
            <span>待办事项</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <template #title>
            <span>关于</span>
          </template>
        </el-menu-item>
      </el-menu>

      <!-- (已恢复) 外部链接区域 -->
      <div class="flex-grow" />
      <div class="sidebar-footer" :class="{ 'is-collapsed': isSidebarCollapsed }">
        <a
          href="https://github.com/topmkter"
          target="_blank"
          rel="noopener noreferrer"
        >
          <el-icon><ChromeFilled /></el-icon>
          <span v-if="!isSidebarCollapsed">GitHub</span>
        </a>
        <a
          href="https://smlyfm.github.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <el-icon><Link /></el-icon>
          <span v-if="!isSidebarCollapsed">博客</span>
        </a>
      </div>
    </el-aside>

    <div class="resizer" @mousedown="startDrag">
      <div class="resizer-handle" @click.stop="toggleCollapse" title="折叠/展开">
        <el-icon>
          <CaretLeft v-if="sidebarWidth > 0" />
          <CaretRight v-else />
        </el-icon>
      </div>
    </div>

    <el-container class="main-content-container">
      <el-header>
        <div class="header-left">
          <span>面包屑导航</span>
        </div>
        <div class="user-info">
          <span>欢迎, {{ authStore.user?.username }}</span>
          <el-tooltip content="退出登录" placement="bottom">
            <el-button @click="handleLogout" :icon="SwitchButton" circle text />
          </el-tooltip>
        </div>
      </el-header>
      <el-main>
        <router-view v-slot="{ Component, route }">
          <transition name="main-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import {
  House,
  DataAnalysis,
  PieChart,
  Memo,
  SwitchButton,
  CaretLeft,
  CaretRight,
  InfoFilled,
  Link,
  ChromeFilled,
} from '@element-plus/icons-vue';

const authStore = useAuthStore();
const router = useRouter();
const sidebarWidth = ref(220);
const widthBeforeCollapse = ref(220);
const isSidebarCollapsed = computed(() => sidebarWidth.value < 70);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const startDrag = (e: MouseEvent) => {
  e.preventDefault();
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';

  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  const handleMouseMove = (moveEvent: MouseEvent) => {
    sidebarWidth.value = Math.max(
      160,
      Math.min(startWidth + moveEvent.clientX - startX, 400)
    );
  };

  const handleMouseUp = () => {
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
};

const toggleCollapse = () => {
  if (sidebarWidth.value > 0) {
    widthBeforeCollapse.value = sidebarWidth.value;
    sidebarWidth.value = 0;
  } else {
    sidebarWidth.value = widthBeforeCollapse.value;
  }
};

onUnmounted(() => {
  window.removeEventListener('mousemove', () => {});
  window.removeEventListener('mouseup', () => {});
});
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}
.sidebar-container {
  display: flex;
  flex-direction: column;
  background-color: #001529;
  transition: width 0.28s;
  position: relative;
  z-index: 10;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 22px;
  font-weight: 600;
  background-color: #002140;
  overflow: hidden;
  white-space: nowrap;
}
.el-menu {
  border-right: none;
  background-color: #001529;
}
.el-menu-item {
  color: rgba(255, 255, 255, 0.65);
}
.el-menu-item:hover {
  background-color: #000c17 !important;
  color: #fff !important;
}
.el-menu-item.is-active {
  color: #fff !important;
  background-color: #1890ff !important;
}
.flex-grow {
  flex-grow: 1;
}
.sidebar-footer {
  padding: 20px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s;
}
.sidebar-footer a {
  color: inherit;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}
.sidebar-footer a:hover {
  color: #fff;
}
.sidebar-footer.is-collapsed {
  flex-direction: column;
  gap: 15px;
}
.resizer {
  width: 5px;
  cursor: col-resize;
  background-color: #f0f2f5;
  position: relative;
  z-index: 9;
  transition: background-color 0.3s;
}
.resizer:hover .resizer-handle {
  opacity: 1;
}
.resizer-handle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 70px;
  background-color: #a8abb2;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 0.5;
}
.resizer-handle:hover {
  background-color: #1890ff;
}
.main-content-container {
  overflow-x: auto;
  flex-grow: 1;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}
.el-main {
  padding: 24px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}
.main-fade-enter-active,
.main-fade-leave-active {
  transition: opacity 0.2s ease;
}
.main-fade-enter-from,
.main-fade-leave-to {
  opacity: 0;
}
</style>
