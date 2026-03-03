const express = require('express');
const requireAuth = require('../../middleware/auth');
const { checkoutPreviewHandler, placeOrderHandler } = require('./order.controller');

const router = express.Router();

router.use(requireAuth);

router.post('/preview', checkoutPreviewHandler);
router.post('/place-order', placeOrderHandler);

module.exports = router;

