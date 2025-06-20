<!--
=================================================================
文件: client/src/views/AboutView.vue
说明: 这是一个全新设计的“关于”页面，详细介绍了项目的技术架构和功能。
=================================================================
-->
<template>
  <div class="about-page">
    <el-card class="about-card">
      <template #header>
        <div class="card-header">
          <el-icon :size="24" style="margin-right: 12px;"><CollectionTag /></el-icon>
          <span>关于项目：信息全景分析数据系统</span>
        </div>
      </template>

      <div class="content">
        <p>
          本项目是一个前后端分离的现代化B/S架构数据处理与可视化平台，旨在为教育管理领域提供一个高性能、高可扩展性的解决方案。系统采用了微服务思想，将不同职责的后端逻辑解耦，以应对多样化的业务需求。
        </p>

        <el-divider />

        <h3>
          <el-icon><DataLine /></el-icon>
          技术架构 (System Architecture)
        </h3>
        <p>
          系统采用混合后端架构，充分发挥不同技术的优势。前端作为统一入口，通过Node.js主后端与各个微服务进行智能交互：
        </p>

        <el-timeline>
          <el-timeline-item timestamp="前端 (Frontend)" placement="top">
            <el-card>
              <h4>Vue 3 + Vite + TypeScript</h4>
              <p>基于最新的前端技术栈构建，提供极速的开发体验和高性能的渲染。使用 TypeScript 保证代码的类型安全和可维护性，UI层采用 Element Plus 组件库，快速构建专业美观的界面。</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="Node.js 主后端 (API Gateway & Core Business)" placement="top">
            <el-card>
              <h4>Express.js + Sequelize</h4>
              <p>作为系统的**API网关**和**业务处理中心**。它直接面向前端，负责处理用户认证、会话管理、数据导入导出等核心业务，并作为“项目经理”，将特定的计算密集型任务请求分发给专门的Python分析服务。</p>
            </el-card>
          </el-timeline-item>
          <el-timeline-item timestamp="Python 分析服务 (Computation Core)" placement="top">
             <el-card>
              <h4>Flask + Pandas + Scikit-learn</h4>
              <p>一个独立的Flask微服务，扮演“数据科学家”的角色。它利用Pandas和NumPy等强大的库，专门负责处理批量数据的统计与分析任务（如生成图表数据），并将计算结果返回给Node.js主后端。</p>
            </el-card>
          </el-timeline-item>
           <el-timeline-item timestamp="Rust 待办事项服务 (High-Performance Service)" placement="top">
             <el-card>
              <h4>Axum + Tokio + SQLx</h4>
              <p>一个独立的、基于Tokio的Axum微服务，体现了系统对高性能、高并发和内存安全性的追求。它专门负责处理“待办事项”模块的所有CRUD操作，前端可直接与其通信，实现最高的响应速度。</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>

        <el-divider />

        <h3>
          <el-icon><Finished /></el-icon>
          前端已实现功能 (Frontend Features)
        </h3>
        <ul>
            <li><strong>响应式与可交互布局:</strong> 整个系统框架支持用户通过拖拽自由调整侧边栏宽度，并能根据屏幕尺寸自动适配，提供卓越的PC端体验。</li>
            <li><strong>用户认证:</strong> 包含登录、登出、路由守卫、Token持久化等完整的认证流程。</li>
            <li><strong>数据管理:</strong> 实现了对学生数据的增、删、改、查(CRUD)功能，支持实时搜索、分页，以及通过Excel进行批量导入和导出。</li>
            <li><strong>可视化分析:</strong> 构建了可定制的图表仪表盘，支持折线图、热力图、模型图等多种图表类型和服务器端图片导出。</li>
            <li><strong>日历待办事项:</strong> 实现了与高性能Rust后端直连的待办事项管理模块，支持日历视图、优先级设置、Markdown笔记的实时预览、导入和导出。</li>
        </ul>

        <el-divider />

        <h3>
          <el-icon><User /></el-icon>
          开发者信息
        </h3>
        <!-- (已修正) 将开发者信息整合到一行，并调整样式 -->
        <div class="dev-info">
          <span>开发者: topmkter (cjx)</span>
          <el-divider direction="vertical" />
          <el-link type="primary" href="https://github.com/topmkter" target="_blank">GitHub</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" href="https://smlyfm.github.io/" target="_blank">个人博客</el-link>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { CollectionTag, DataLine, Finished, User, Tools } from '@element-plus/icons-vue';
</script>

<style scoped>
.about-page {
  padding: 0;
}
.about-card {
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}
.card-header {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #303133;
}
.content {
  font-size: 1rem;
  line-height: 1.8;
  color: #606266;
}
.content p {
  margin-bottom: 20px;
  text-indent: 2em;
}
.content h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 20px;
  font-size: 1.2rem;
  color: #303133;
  border-left: 4px solid var(--el-color-primary);
  padding-left: 12px;
}
.content ul {
  list-style-type: none;
  padding-left: 0;
}
.content ul li {
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
}
.content ul li::before {
    content: '✓';
    color: var(--el-color-success);
    font-weight: bold;
    margin-right: 10px;
}
.el-tag {
  margin: 0 4px;
}
/* (已修正) 开发者信息区域样式 */
.dev-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  font-size: 1rem;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}
.el-timeline-item h4 {
  font-size: 1.1rem;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}
.el-timeline-item p {
    text-indent: 0em;
}
</style>
