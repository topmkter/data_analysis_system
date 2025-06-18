<template>
  <div class="analysis-view">
    <!-- 1. (已美化) 选项按钮控制区 -->
    <el-card class="controls-card">
      <div class="controls-header">
        <div class="controls-title-wrapper">
            <el-icon :size="22"><Setting /></el-icon>
            <div>
                <span class="controls-title">图表显示控制</span>
                <p class="controls-subtitle">选择您希望在此页面上查看的分析图表</p>
            </div>
        </div>
        <el-button @click="resetCharts" type="primary" :icon="RefreshRight" round>重置视图</el-button>
      </div>
      <el-checkbox-group v-model="visibleCharts" @change="handleChartVisibilityChange">
        <el-checkbox label="distributionChart">成绩分布</el-checkbox>
        <el-checkbox label="trendChart">班级成绩趋势</el-checkbox>
        <el-checkbox label="heatmapChart">班级-分数段热力图</el-checkbox>
        <el-checkbox label="relationChart">学生关系模型</el-checkbox>
      </el-checkbox-group>
    </el-card>

    <!-- 2. (已调整) 图表展示区 -->
    <!-- 第一行：成绩分布 与 班级成绩趋势 -->
    <el-row :gutter="20" v-if="visibleCharts.includes('distributionChart') || visibleCharts.includes('trendChart')">
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" v-if="visibleCharts.includes('distributionChart')">
        <el-card class="chart-card" v-loading="distributionChartLoading">
          <template #header>
            <div class="chart-header">
              <span>成绩分布</span>
              <el-button @click="exportChart('distributionChart')" :icon="Download" text circle/>
            </div>
          </template>
          <div ref="distributionChart" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" v-if="visibleCharts.includes('trendChart')">
        <el-card class="chart-card" v-loading="trendChartLoading">
          <template #header>
            <div class="chart-header">
              <span>班级成绩趋势</span>
              <el-button @click="exportChart('trendChart')" :icon="Download" text circle/>
            </div>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：热力图 -->
    <el-row :gutter="20" v-if="visibleCharts.includes('heatmapChart')">
      <el-col :span="24">
        <el-card class="chart-card" v-loading="heatmapChartLoading">
           <template #header>
            <div class="chart-header">
              <span>班级-分数段热力图</span>
              <el-button @click="exportChart('heatmapChart')" :icon="Download" text circle/>
            </div>
          </template>
          <div ref="heatmapChart" class="chart-container" style="height: 500px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：学生关系模型 -->
    <el-row :gutter="20" v-if="visibleCharts.includes('relationChart')">
      <el-col :span="24">
          <el-card class="chart-card" v-loading="relationChartLoading">
            <template #header>
                <div class="chart-header">
                <span>学生关系模型</span>
                <el-tooltip content="同班且分数相近" placement="top">
                    <el-icon><InfoFilled /></el-icon>
                </el-tooltip>
                <el-button @click="exportChart('relationChart')" :icon="Download" text circle/>
                </div>
            </template>
            <div ref="relationChart" class="chart-container" style="height: 500px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Download, InfoFilled, Setting, RefreshRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import {
  getGradeDistributionAPI,
  getClassScoreTrendAPI,
  getScoreHeatmapAPI,
  getStudentRelationModelAPI,
  exportChartAPI,
} from '@/api/analysis';

// --- (新增) 控制图表可见性 ---
const allChartKeys = ['distributionChart', 'trendChart', 'heatmapChart', 'relationChart'];
const visibleCharts = ref([...allChartKeys]);


// Chart Loading States
const distributionChartLoading = ref(true);
const trendChartLoading = ref(true);
const heatmapChartLoading = ref(true);
const relationChartLoading = ref(true);

// Chart DOM Refs
const distributionChart = ref<HTMLElement>();
const trendChart = ref<HTMLElement>();
const heatmapChart = ref<HTMLElement>();
const relationChart = ref<HTMLElement>();

// ECharts Instances
const chartInstances = {
  distributionChart: shallowRef<echarts.ECharts>(),
  trendChart: shallowRef<echarts.ECharts>(),
  heatmapChart: shallowRef<echarts.ECharts>(),
  relationChart: shallowRef<echarts.ECharts>(),
};

// Chart Initializers
const chartInitializers = {
  distributionChart: async () => {
    distributionChartLoading.value = true;
    try {
      const res = await getGradeDistributionAPI();
      const { data } = res.data;
      if (!distributionChart.value || !data?.length) return;
      const chart = echarts.init(distributionChart.value);
      chart.setOption({
        tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c}人 ({d}%)' },
        legend: { orient: 'vertical', left: 'left', data: data.map((item: any) => item.name) },
        series: [{ name: '成绩等级', type: 'pie', radius: '55%', center: ['50%', '60%'], data: data, emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }],
      });
      chartInstances.distributionChart.value = chart;
    } finally {
      distributionChartLoading.value = false;
    }
  },
  trendChart: async () => {
    trendChartLoading.value = true;
    try {
      const res = await getClassScoreTrendAPI();
      const { data } = res.data;
      if (!trendChart.value || !data.classNames?.length) return;
      const chart = echarts.init(trendChart.value);
      chart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['平均分', '最高分', '最低分'] },
        xAxis: { type: 'category', data: data.classNames },
        yAxis: { type: 'value' },
        series: [
          { name: '平均分', type: 'bar', data: data.averageScores },
          { name: '最高分', type: 'line', smooth: true, data: data.maxScores, symbol: 'none' },
          { name: '最低分', type: 'line', smooth: true, data: data.minScores, symbol: 'none' },
        ],
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      });
      chartInstances.trendChart.value = chart;
    } finally {
      trendChartLoading.value = false;
    }
  },
  heatmapChart: async () => {
    heatmapChartLoading.value = true;
    try {
      const res = await getScoreHeatmapAPI();
      const { data, xLabels, yLabels } = res.data;
      if (!heatmapChart.value || !data?.length) return;
      const chart = echarts.init(heatmapChart.value);
      chart.setOption({
        tooltip: { position: 'top' },
        grid: { containLabel: true },
        xAxis: { type: 'category', data: xLabels, splitArea: { show: true } },
        yAxis: { type: 'category', data: yLabels, splitArea: { show: true } },
        visualMap: { min: 0, max: Math.max(...data.map((item: any) => item[2])), calculable: true, orient: 'horizontal', left: 'center', bottom: '0' },
        series: [{ name: '学生人数', type: 'heatmap', data: data, label: { show: true }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } } }],
      });
      chartInstances.heatmapChart.value = chart;
    } finally {
      heatmapChartLoading.value = false;
    }
  },
  relationChart: async () => {
    relationChartLoading.value = true;
    try {
      const res = await getStudentRelationModelAPI();
      const { nodes, links, categories } = res.data;
      if (!relationChart.value || !nodes?.length) return;
      const chart = echarts.init(relationChart.value);
      chart.setOption({
        tooltip: { formatter: (params: any) => params.dataType === 'node' ? `${params.data.name}<br/>分数: ${params.data.value}` : '' },
        legend: [{ data: categories.map((a: any) => a.name), top: 'bottom', selectedMode: 'multiple' }],
        series: [{ type: 'graph', layout: 'force', data: nodes, links: links, categories: categories, roam: true, label: { show: true, position: 'right' }, force: { repulsion: 100 } }],
      });
      chartInstances.relationChart.value = chart;
    } finally {
      relationChartLoading.value = false;
    }
  },
};

const exportChart = async (chartName: keyof typeof chartInstances) => {
  const chartInstance = chartInstances[chartName].value;
  if (chartInstance) {
    const option = chartInstance.getOption();
    try {
      const res = await exportChartAPI({ option }); // 确保以对象形式发送
      const blob = new Blob([res.data], { type: 'image/png' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${chartName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Export failed:', error);
        ElMessage.error('图表导出失败，请检查后端服务。');
    }
  }
};

// --- (已修改) 仅初始化可见的图表 ---
const initCharts = () => {
  // 销毁所有现有实例，以防重复渲染
  Object.values(chartInstances).forEach(instance => instance.value?.dispose());

  // 使用 nextTick 确保DOM已更新
  nextTick(() => {
    visibleCharts.value.forEach(chartKey => {
      const key = chartKey as keyof typeof chartInitializers;
      if (chartInitializers[key]) {
        chartInitializers[key]();
      }
    });
  });
};

// --- (新增) 处理复选框变化 ---
const handleChartVisibilityChange = () => {
    initCharts();
}

// --- (新增) 重置视图 ---
const resetCharts = () => {
    visibleCharts.value = [...allChartKeys];
    initCharts();
}

const resizeCharts = () => {
  Object.values(chartInstances).forEach((c) => c.value?.resize());
};

onMounted(() => {
    initCharts();
    window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  Object.values(chartInstances).forEach((c) => {
    if (c.value) {
      c.value.dispose();
    }
  });
});
</script>

<style scoped>
.analysis-view {
  padding: 24px;
  background-color: #f7f8fa;
}
.controls-card {
  margin-bottom: 20px;
  border-radius: 12px;
}
.controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f2f5;
}
.controls-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}
.controls-title-wrapper .el-icon {
  color: var(--el-color-primary);
}
.controls-title {
  font-weight: 600;
  font-size: 18px;
  line-height: 1;
}
.controls-subtitle {
  font-size: 12px;
  color: #909399;
  margin: 6px 0 0 0;
  line-height: 1;
}
.el-row {
    margin-bottom: 20px;
}
.el-row:last-child {
    margin-bottom: 0;
}
.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
}
.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}
:deep(.el-card__header) {
    border-bottom: 1px solid #e4e7ed;
}
:deep(.el-card__body) {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 20px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 18px;
  color: #333;
}
.chart-header .el-icon {
    cursor: help;
    color: #909399;
}
.chart-container {
  width: 100%;
  height: 400px; /* 默认高度 */
}
</style>
