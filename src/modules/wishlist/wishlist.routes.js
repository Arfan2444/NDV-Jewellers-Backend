const express = require('express');
const requireAuth = require('../../middleware/auth');
const {
  getWishlistHandler,
  addWishlistItemHandler,
  removeWishlistItemHandler,
  moveToCartHandler,
} = require('./wishlist.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/', getWishlistHandler);
router.post('/items', addWishlistItemHandler);
router.delete('/items/:productId', removeWishlistItemHandler);
router.post('/move-to-cart', moveToCartHandler);

module.exports = router;

