const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/setup-admin
router.post('/setup-admin', authController.setupAdmin);

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;