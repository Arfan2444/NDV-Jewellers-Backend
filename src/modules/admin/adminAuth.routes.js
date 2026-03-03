const express = require('express');
const requireAuth = require('../../middleware/auth');
const requireRole = require('../../middleware/roles');
const { adminRegister, adminLogin, adminLogout } = require('./adminAuth.controller');

const router = express.Router();

// Admin login/logout (public endpoints; verify role on login)
router.post('/login', adminLogin);
router.post('/logout', adminLogout);

// Admin registration - only existing admins can create new admins
router.post('/register', requireAuth, requireRole('admin'), adminRegister);

module.exports = router;

