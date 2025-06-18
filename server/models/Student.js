const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db');
const User = require('./User');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: true, // 允许学号为空
  },
  className: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  // 外键，关联到上传数据的用户
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

User.hasMany(Student, { foreignKey: 'userId' });
Student.belongsTo(User, { foreignKey: 'userId' });

module.exports = Student;
