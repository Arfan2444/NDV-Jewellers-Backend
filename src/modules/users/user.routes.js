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
} = require('./user.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/me/addresses', getMyAddresses);
router.post('/me/addresses', addMyAddress);
router.put('/me/addresses/:addressId', updateMyAddress);
router.delete('/me/addresses/:addressId', deleteMyAddress);
router.delete('/me', deleteMe);

module.exports = router;

