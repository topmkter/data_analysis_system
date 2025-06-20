/*
 * =================================================================
 * 后端更新说明:
 * 1. 在 `controllers/dataController.js` 中新增了 addStudent, updateStudent, deleteStudent 函数。
 * 2. 在 `routes/data.js` 中添加了对应 POST, PUT, DELETE 方法的路由。
 * 其他后端文件无需修改。
 * =================================================================
 */

// --- 文件: server/controllers/dataController.js  ---
const xlsx = require('xlsx');
const Student = require('../models/Student');

// 获取当前用户的所有学生数据
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.findAll({ where: { userId: req.user.id }, order: [['id', 'DESC']] });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch student data.', error: error.message });
    }
};

// (新增) 手动创建一条数据
exports.addStudent = async (req, res) => {
    try {
        const { name, studentId, className, score } = req.body;
        const student = await Student.create({
            name,
            studentId,
            className,
            score,
            userId: req.user.id
        });
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create student record.', error: error.message });
    }
};

// (新增) 更新一条学生数据
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, studentId, className, score } = req.body;
        
        // 查找记录，并确保该记录属于当前登录用户
        const student = await Student.findOne({ where: { id, userId: req.user.id }});

        if (!student) {
            return res.status(404).json({ message: 'Student not found or you do not have permission.' });
        }

        // 更新数据
        student.name = name;
        student.studentId = studentId;
        student.className = className;
        student.score = score;
        await student.save();

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update student record.', error: error.message });
    }
};

// (新增) 删除一条学生数据
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Student.destroy({ where: { id, userId: req.user.id } });
        
        if (deleted) {
            res.status(204).send(); // 204 No Content 表示成功删除
        } else {
            res.status(404).json({ message: 'Student not found or you do not have permission.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete student record.', error: error.message });
    }
};


// --- 从Excel导入和导出到Excel的功能保持不变 ---
exports.importFromExcel = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        const studentData = jsonData.map(row => ({
            name: row['姓名'],
            studentId: row['学号'],
            className: row['班级'],
            score: parseFloat(row['成绩']),
            userId: req.user.id
        }));

        await Student.bulkCreate(studentData);
        res.status(201).json({ message: `${studentData.length} records imported successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process Excel file.', error: error.message });
    }
};

exports.exportToExcel = async (req, res) => {
    try {
        const students = await Student.findAll({ 
            where: { userId: req.user.id },
            attributes: ['name', 'studentId', 'className', 'score'],
            raw: true 
        });
        
        const dataToExport = students.map(s => ({
            '姓名': s.name,
            '学号': s.studentId,
            '班级': s.className,
            '成绩': s.score
        }));

        const worksheet = xlsx.utils.json_to_sheet(dataToExport);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, '学生数据');

        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename="students.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to export data.', error: error.message });
    }
};