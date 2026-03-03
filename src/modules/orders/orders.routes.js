const express = require('express');
const requireAuth = require('../../middleware/auth');
const { listOrdersHandler, getOrderHandler } = require('./order.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', listOrdersHandler);
router.get('/:id', getOrderHandler);

module.exports = router;

