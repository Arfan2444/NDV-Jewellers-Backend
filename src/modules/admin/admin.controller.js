const Joi = require('joi');
const {
  getProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
} = require('../products/product.controller');
const Order = require('../orders/order.model');
const { listRequests, updateRequest } = require('../custom-orders/customOrders.service');
const User = require('../users/user.model');

const updateOrderSchema = Joi.object({
  status: Joi.string().valid('pending', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
}).min(1);

const updateUserSchema = Joi.object({
  role: Joi.string().valid('user', 'admin'),
  isLocked: Joi.boolean(),
}).min(1);

async function adminListOrdersHandler(req, res, next) {
  try {
    const { status, userId, page, limit } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (userId) filters.user = userId;

    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Order.find(filters).sort({ placedAt: -1, createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filters),
    ]);

    res.json({
      success: true,
      items,
      total,
      page: pageNum,
      pageSize: limitNum,
    });
  } catch (err) {
    next(err);
  }
}

async function adminGetOrderHandler(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateOrderHandler(req, res, next) {
  try {
    const { error, value } = updateOrderSchema.validate(req.body || {});
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, value, { new: true });
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

async function adminListCustomOrdersHandler(req, res, next) {
  try {
    const result = await listRequests({
      userId: null,
      isAdmin: true,
      query: req.query,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateCustomOrderHandler(req, res, next) {
  try {
    const updated = await updateRequest({
      requestId: req.params.id,
      patch: req.body || {},
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function adminListUsersHandler(req, res, next) {
  try {
    const { role, isLocked, search, page, limit } = req.query;
    const filters = {};

    if (role) filters.role = role;
    if (isLocked !== undefined) filters.isLocked = isLocked === 'true';
    if (search) {
      const regex = new RegExp(String(search), 'i');
      filters.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 20;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      User.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-passwordHash'),
      User.countDocuments(filters),
    ]);

    res.json({
      success: true,
      items,
      total,
      page: pageNum,
      pageSize: limitNum,
    });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateUserHandler(req, res, next) {
  try {
    const { error, value } = updateUserSchema.validate(req.body || {});
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // product
  getProducts,
  getProduct,
  createProductController,
  updateProductController,
  deleteProductController,
  // orders
  adminListOrdersHandler,
  adminGetOrderHandler,
  adminUpdateOrderHandler,
  // custom orders
  adminListCustomOrdersHandler,
  adminUpdateCustomOrderHandler,
  // users
  adminListUsersHandler,
  adminUpdateUserHandler,
};

