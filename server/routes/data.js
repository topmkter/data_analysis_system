// --- 文件: server/routes/data.js  ---
const express = require('express');
const router = express.Router();
const multer = require('multer');
const dataController = require('../controllers/dataController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// 所有该路由下的请求都需要先通过JWT认证
router.use(authMiddleware);

// 查询所有数据
router.get('/', dataController.getStudents);
// 导出为Excel
router.get('/export', dataController.exportToExcel);

// 导入Excel
router.post('/import', upload.single('file'), dataController.importFromExcel);

// (新增) 新增一条记录
router.post('/', dataController.addStudent);

// (新增) 更新一条记录
router.put('/:id', dataController.updateStudent);

// (新增) 删除一条记录
router.delete('/:id', dataController.deleteStudent);

module.exports = router;
