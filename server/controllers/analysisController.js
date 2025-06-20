/*
 * =================================================================
 * 文件: server/controllers/analysisController.js
 * 说明:  采用了更可靠的渲染等待机制，以修复
 * 下载图片为空白的问题，还未解决
 * =================================================================
 */
const Student = require('../models/Student');
const axios = require('axios');
const puppeteer = require('puppeteer');

const PYTHON_ANALYSIS_URL = process.env.PYTHON_ANALYSIS_URL || 'http://localhost:5000/analyze';

/**
 * 一个通用的函数，用于从数据库获取学生数据并调用Python服务
 * @param {string} task - 要执行的分析任务名称
 * @param {object} req - Express的请求对象
 * @param {object} res - Express的响应对象
 */
const analyzeWithPython = async (task, req, res) => {
    try {
        // 1. 从数据库获取当前用户的所有学生数据
        const students = await Student.findAll({
            where: { userId: req.user.id },
            attributes: ['id', 'name', 'className', 'score'], // 只选择需要的列
            raw: true
        });

        if (students.length === 0) {
            // 如果没有数据，根据任务类型返回一个合理的空结构
            if (task === 'student_relation_model') {
                 return res.status(200).json({ data: { nodes: [], links: [], categories: [] }});
            }
             if (task === 'grade_distribution') {
                return res.status(200).json({ data: [] });
            }
            return res.status(200).json({ data: {} });
        }

        // 2. 调用Python服务进行分析
        const analysisResponse = await axios.post(PYTHON_ANALYSIS_URL, {
            task: task,      // 告诉Python要做什么分析
            data: students   // 将原始学生数据发送过去
        });

        // 3. 将从Python获取的分析结果返回给前端
        res.status(200).json(analysisResponse.data);

    } catch (error) {
        console.error(`Error in task '${task}':`, error.message);
        res.status(500).json({ message: `Failed to get data for task: ${task}` });
    }
};

// --- 定义具体的分析接口 ---
exports.getGradeDistribution = (req, res) => analyzeWithPython('grade_distribution', req, res);
exports.getClassScoreTrend = (req, res) => analyzeWithPython('class_score_trend', req, res);
exports.getScoreHeatmap = (req, res) => analyzeWithPython('score_heatmap', req, res);
exports.getStudentRelationModel = (req, res) => analyzeWithPython('student_relation_model', req, res);

/**
 * 服务器端导出图表为PNG的函数
 */
exports.exportChartToPng = async (req, res) => {
    const chartOption = req.body.option;

    if (!chartOption) {
        return res.status(400).send({ message: 'Chart option is required.' });
    }

    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // 1. 设置页面内容和视口
        await page.setViewport({ width: 800, height: 600 });
        await page.setContent(`<div id="chart" style="width: 800px; height: 600px;"></div>`);

        // 2. 注入 ECharts 库并等待其加载完成
        await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js' });

        // 3. 在页面中初始化并设置图表
        await page.evaluate((option) => {
            const chart = echarts.init(document.getElementById('chart'));
            chart.setOption(option);
        }, chartOption);

        // 4. 等待一个短暂的时间以确保动画渲染完成
        await new Promise(resolve => setTimeout(resolve, 500));

        const chartElement = await page.$('#chart');
        if (!chartElement) {
            throw new Error('Chart element could not be found on the page.');
        }
        const imageBuffer = await chartElement.screenshot({ type: 'png' });

        // 设置正确的响应头，使浏览器能下载文件
        res.set('Content-Type', 'image/png');
        res.set('Content-Disposition', 'attachment; filename="chart.png"');
        res.send(imageBuffer);

    } catch (error) {
        console.error('Failed to export chart:', error);
        res.status(500).send({ message: 'Failed to export chart: ' + error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
