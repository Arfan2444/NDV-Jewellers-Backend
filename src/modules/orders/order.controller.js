const Joi = require('joi');
const { buildOrderPreview, placeOrder, listOrders, getOrderById } = require('./order.service');

const addressSchema = Joi.object({
  fullName: Joi.string().required(),
  phone: Joi.string().required(),
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().default('IN'),
});

const previewSchema = Joi.object({
  cartId: Joi.string().optional(),
});

const placeOrderSchema = Joi.object({
  cartId: Joi.string().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  paymentMethod: Joi.string().required(),
  paymentDetails: Joi.object().unknown(true).optional(),
});

async function checkoutPreviewHandler(req, res, next) {
  try {
    const { error, value } = previewSchema.validate(req.body || {});
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const preview = await buildOrderPreview({
      userId: req.user.id,
      cartId: value.cartId,
    });

    res.json({
      success: true,
      data: preview,
    });
  } catch (err) {
    next(err);
  }
}

async function placeOrderHandler(req, res, next) {
  try {
    const { error, value } = placeOrderSchema.validate(req.body || {});
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const { cartId, shippingAddress, billingAddress, paymentMethod, paymentDetails } = value;

    const order = await placeOrder({
      userId: req.user.id,
      cartId,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentDetails,
    });

    res.status(201).json({
      success: true,
      data: {
        id: order.id,
        summary: order,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listOrdersHandler(req, res, next) {
  try {
    const { status, page, limit } = req.query;
    const result = await listOrders({
      userId: req.user.id,
      status,
      page,
      limit,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderHandler(req, res, next) {
  try {
    const order = await getOrderById({
      userId: req.user.id,
      orderId: req.params.id,
    });

    res.json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkoutPreviewHandler,
  placeOrderHandler,
  listOrdersHandler,
  getOrderHandler,
};

