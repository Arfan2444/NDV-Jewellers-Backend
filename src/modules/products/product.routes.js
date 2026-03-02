const express = require('express');
const {
  getProducts,
  getProduct,
  getFeatured,
  getCategories,
  createProductController,
  updateProductController,
  deleteProductController,
} = require('./product.controller');
const requireAuth = require('../../middleware/auth');
const requireRole = require('../../middleware/roles');

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/categories', getCategories);
router.get('/:slug', getProduct);

router.post('/admin', requireAuth, requireRole('admin'), createProductController);
router.patch('/admin/:id', requireAuth, requireRole('admin'), updateProductController);
router.delete('/admin/:id', requireAuth, requireRole('admin'), deleteProductController);

module.exports = router;

