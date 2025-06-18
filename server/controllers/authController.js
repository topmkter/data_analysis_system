const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 一次性设置管理员账号
const setupAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin account already exists.' });
    }

    const admin = await User.create({
      username: 'admin',
      password: 'adminadmin', // 密码在这里传入，模型钩子会自动加密
      role: 'admin',
    });

    res.status(201).json({ message: 'Admin account created successfully.', user: { id: admin.id, username: admin.username, role: admin.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error setting up admin account.', error: error.message });
  }
};

// 用户登录
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // 用户不存在
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' }); // 密码错误
    }

    // 密码正确，生成JWT
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d', // Token有效期为7天
    });

    res.status(200).json({
      message: 'Logged in successfully.',
      token: token,
      user: payload
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

module.exports = {
  setupAdmin,
  login,
};