/*
 * =================================================================
 * 3. 新增的KPI卡片组件 (`client/src/components/`)
 * 说明: (新增) 一个可复用的、用于展示关键指标的组件。
 * =================================================================
 */

// --- 文件: client/src/components/KpiCard.vue (新增) ---
<template>
  <el-card shadow="hover" class="kpi-card">
    <div class="kpi-content">
      <div class="kpi-icon" :style="{ backgroundColor: iconBgColor }">
        <el-icon :size="32" color="#fff">
          <slot name="icon"></slot>
        </el-icon>
      </div>
      <div class="kpi-text">
        <div class="kpi-label">{{ label }}</div>
        <div class="kpi-value">
          <el-skeleton :rows="0" animated v-if="loading" />
          <span v-else>{{ value }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
defineProps({
  label: String,
  value: [String, Number],
  iconBgColor: {
    type: String,
    default: '#409EFF',
  },
  loading: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.kpi-card {
  cursor: pointer;
  transition: all 0.3s ease;
}
.kpi-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.kpi-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.kpi-icon {
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.kpi-text {
  display: flex;
  flex-direction: column;
}
.kpi-label {
  font-size: 14px;
  color: #606266;
}
.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-top: 5px;
}
</style>
