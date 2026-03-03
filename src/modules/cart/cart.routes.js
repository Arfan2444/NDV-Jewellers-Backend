const express = require('express');
const optionalAuth = require('../../middleware/optionalAuth');
const {
  getCartHandler,
  addCartItemHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  applyCouponHandler,
} = require('./cart.controller');

const router = express.Router();

router.use(optionalAuth);

router.get('/', getCartHandler);
router.post('/items', addCartItemHandler);
router.patch('/items/:itemId', updateCartItemHandler);
router.delete('/items/:itemId', removeCartItemHandler);
router.post('/apply-coupon', applyCouponHandler);

module.exports = router;

