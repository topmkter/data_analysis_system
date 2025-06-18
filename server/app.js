require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/db');

// 引入所有路由
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const analysisRoutes = require('./routes/analysis');
const todoRoutes = require('./routes/todo');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/todos', todoRoutes);

// 启动服务器并连接数据库
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // 同步所有模型。这将会创建 Student 和 Todo 表。
    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server or connect to the database:', error);
  }
};

startServer();
