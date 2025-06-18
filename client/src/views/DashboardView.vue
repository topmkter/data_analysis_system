<template>
  <div class="dashboard-view">
    <!-- 第一行：欢迎语和KPI卡片 -->
    <el-card class="welcome-card shadow-lg">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎, admin!</h2>
          <p>祝您有美好的一天。您的数据分析之旅从这里开始。</p>
        </div>
        <div class="welcome-image">
          <img src="https://placehold.co/150x100/FFFFFF/409EFF?text=Hello!" alt="Welcome Illustration">
        </div>
      </div>
    </el-card>

    <!-- KPI 卡片区域 -->
    <el-row :gutter="20" v-loading="loading">
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <KpiCard label="总学生数" :value="stats.studentCount" icon-bg-color="#409EFF">
          <template #icon><User /></template>
        </KpiCard>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <KpiCard label="班级总数" :value="stats.classCount" icon-bg-color="#67C23A">
          <template #icon><School /></template>
        </KpiCard>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <KpiCard label="平均分数" :value="stats.averageScore" icon-bg-color="#E6A23C">
          <template #icon><TrophyBase /></template>
        </KpiCard>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <KpiCard label="最高分" :value="stats.maxScore" icon-bg-color="#F56C6C">
          <template #icon><MagicStick /></template>
        </KpiCard>
      </el-col>
    </el-row>

    <!-- 第二行：静态图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>近期活跃度走势 (示例)</span>
            </div>
          </template>
          <div ref="lineChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue';
import KpiCard from '@/components/KpiCard.vue';
import { User, School, TrophyBase, MagicStick, Memo } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getStudentsAPI } from '@/api/data'; // 引入API

// 定义统计数据的响应式对象
const stats = reactive({
  studentCount: 0,
  classCount: 0,
  averageScore: 0,
  maxScore: 0,
});
const loading = ref(true); // 添加加载状态

// 获取并计算统计数据
const fetchStats = async () => {
  loading.value = true;
  try {
    const studentRes = await getStudentsAPI();
    const students = studentRes.data;

    if (students && students.length > 0) {
      stats.studentCount = students.length;

      // 计算班级总数
      const classNames = new Set(students.map(s => s.className));
      stats.classCount = classNames.size;

      const scores = students.map(s => s.score).filter(s => typeof s === 'number');
      if (scores.length > 0) {
          stats.averageScore = parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
          stats.maxScore = Math.max(...scores);
      }
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error);
  } finally {
    loading.value = false;
  }
}

const lineChart = ref<HTMLElement | null>(null);

// 使用静态示例数据绘制图表
const initLineChart = () => {
  if (!lineChart.value) return;

  const myChart = echarts.init(lineChart.value);
  const option = {
      tooltip: {
          trigger: 'axis',
      },
      legend: {
          data: ['系统访问量', '数据提交量']
      },
      grid: {
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
          type: 'value'
      },
      series: [
          {
              name: '系统访问量',
              type: 'line',
              stack: '总量',
              smooth: true,
              lineStyle: { width: 0 },
              showSymbol: false,
              areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(58, 132, 255, 1)' }, { offset: 1, color: 'rgba(58, 132, 255, 0.3)' }])},
              emphasis: { focus: 'series' },
              data: [120, 132, 101, 134, 90, 230, 210]
          },
          {
              name: '数据提交量',
              type: 'line',
              stack: '总量',
              smooth: true,
              lineStyle: { width: 0 },
              showSymbol: false,
              areaStyle: { opacity: 0.8, color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0, 221, 120, 1)' }, { offset: 1, color: 'rgba(0, 221, 120, 0.3)' }])},
              emphasis: { focus: 'series' },
              data: [220, 182, 191, 234, 290, 330, 310]
          }
      ]
  };
  myChart.setOption(option);

  const resizeChart = () => myChart.resize();
  window.addEventListener('resize', resizeChart);
  // 在组件卸载时移除监听器是个好习惯
}

onMounted(() => {
  fetchStats();
  nextTick(() => {
    initLineChart();
  });
});
</script>

<style scoped>
.dashboard-view {
    padding: 24px;
    background-color: #f7f8fa;
}
.welcome-card {
    margin-bottom: 20px;
    background: linear-gradient(135deg, #4b79a1 0%, #283e51 100%);
    color: white;
    border: none;
    border-radius: 12px;
}
.welcome-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.welcome-text h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
}
.welcome-text p {
    margin-top: 8px;
    margin-bottom: 0;
    font-size: 14px;
    opacity: 0.9;
}
.welcome-image img {
    border-radius: 8px;
    opacity: 0.8;
}

.el-col {
  margin-bottom: 20px;
}
.chart-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
}
.chart-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
}
.card-header {
  font-weight: 600;
  font-size: 18px;
  color: #333;
}
</style>
