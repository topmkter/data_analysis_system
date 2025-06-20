/*
 * =================================================================
 * 文件: server/models/Todo.js 
 * 说明:
 * 此文件已被更新，以完全匹配您为Rust服务调整后的新数据库表结构。
 *
 * 核心改动包括:
 * 1. 新增了 `priority` 和 `due_date` 字段。
 * 2. 使用 Sequelize 的 `field` 属性，将模型中的驼峰式命名(camelCase)
 * 精确地映射到数据库中的蛇形命名(snake_case)，
 * 例如将模型的 `userId` 字段映射到数据库的 `user_id` 列。
 * 3. 在模型关联中也明确指定了外键的蛇形命名。
 * =================================================================
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./User');

const Todo = sequelize.define('Todo', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT, // 使用TEXT类型存储Markdown
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed'),
    defaultValue: 'pending',
  },
  // (新增) 优先级字段
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'medium',
  },
  // (新增) 截止日期字段
  dueDate: {
    type: DataTypes.DATEONLY, // 仅存储日期，不含时间
    allowNull: true,
    field: 'due_date', // 明确映射到数据库的 snake_case 列
  },
  // (已修正) 将 userId 字段映射到数据库的 user_id 列
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  // (已修正) 明确告知Sequelize时间戳列的蛇形命名
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// (已修正) 在模型关联中也明确指定外键的蛇形命名
User.hasMany(Todo, { foreignKey: 'user_id' });
Todo.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Todo;
