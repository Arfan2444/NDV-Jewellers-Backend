const express = require('express');
const requireAuth = require('../../middleware/auth');
const requireRole = require('../../middleware/roles');
const {
  getProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
  adminListOrdersHandler,
  adminGetOrderHandler,
  adminUpdateOrderHandler,
  adminListCustomOrdersHandler,
  adminUpdateCustomOrderHandler,
  adminListUsersHandler,
  adminUpdateUserHandler,
} = require('./admin.controller');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

// Products
router.get('/products', getProducts);
router.get('/products/:slug', getProduct);
router.post('/products', createProductController);
router.patch('/products/:id', updateProductController);
router.delete('/products/:id', deleteProductController);

// Orders
router.get('/orders', adminListOrdersHandler);
router.get('/orders/:id', adminGetOrderHandler);
router.patch('/orders/:id', adminUpdateOrderHandler);

// Custom orders
router.get('/custom-orders', adminListCustomOrdersHandler);
router.patch('/custom-orders/:id', adminUpdateCustomOrderHandler);

// Users
router.get('/users', adminListUsersHandler);
router.patch('/users/:id', adminUpdateUserHandler);

module.exports = router;

