/*
 * =================================================================
 * 1. API 服务层 (`client/src/api/`)
 * 说明: 新增 analysis.ts 文件用于请求分析数据。
 * =================================================================
 */

// --- 文件: client/src/api/analysis.ts (新增) ---
import api from '@/api';

export const getGradeDistributionAPI = () => api.get('/analysis/grade-distribution');
export const getClassScoreTrendAPI = () => api.get('/analysis/class-score-trend');
export const getScoreHeatmapAPI = () => api.get('/analysis/score-heatmap');
export const getStudentRelationModelAPI = () => api.get('/analysis/student-relation-model');

// (新增) 服务器端导出图表
export const exportChartAPI = (option: any) => {
    return api.post('/analysis/export-chart', { option }, {
        responseType: 'blob', // 期望接收一个二进制文件
    });
};
