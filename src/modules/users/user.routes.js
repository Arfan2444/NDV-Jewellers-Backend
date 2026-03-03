const express = require('express');
const requireAuth = require('../../middleware/auth');
const {
  getMe,
  updateMe,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  deleteMe,
  getSettings,
  updateSettings,
  changePassword,
} = require('./user.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/me/addresses', getMyAddresses);
router.post('/me/addresses', addMyAddress);
router.put('/me/addresses/:addressId', updateMyAddress);
router.delete('/me/addresses/:addressId', deleteMyAddress);
router.get('/me/settings', getSettings);
router.patch('/me/settings', updateSettings);
router.post('/me/change-password', changePassword);
router.delete('/me', deleteMe);

module.exports = router;

