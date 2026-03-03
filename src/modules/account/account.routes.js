const express = require('express');
const requireAuth = require('../../middleware/auth');
const { getWishlistHandler } = require('../wishlist/wishlist.controller');

const router = express.Router();

router.use(requireAuth);

router.get('/wishlist', getWishlistHandler);

module.exports = router;

