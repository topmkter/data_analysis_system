// --- 文件: server/routes/analysis.js (为确保正确，提供完整文件) ---
const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// 数据获取路由
router.get('/grade-distribution', analysisController.getGradeDistribution);
router.get('/class-score-trend', analysisController.getClassScoreTrend);
router.get('/score-heatmap', analysisController.getScoreHeatmap);
router.get('/student-relation-model', analysisController.getStudentRelationModel);

// 图表导出路由
router.post('/export-chart', analysisController.exportChartToPng);

module.exports = router;
