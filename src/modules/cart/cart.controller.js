const Joi = require('joi');
const { randomUUID } = require('crypto');
const { getCart, addItemToCart, updateCartItem, removeCartItem, applyCoupon } = require('./cart.service');

const addItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  size: Joi.string().allow('', null),
  metal: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
});

const updateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0),
  size: Joi.string().allow('', null),
  metal: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
}).min(1);

const couponSchema = Joi.object({
  code: Joi.string().required(),
});

function getCartOwnerContext(req, res) {
  if (req.user) {
    return { userId: req.user.id };
  }

  let sessionId = req.cookies.cart_session_id;
  if (!sessionId) {
    sessionId = randomUUID();
    res.cookie('cart_session_id', sessionId, {
      httpOnly: false,
      sameSite: 'lax',
    });
  }

  return { sessionId };
}

async function getCartHandler(req, res, next) {
  try {
    const owner = getCartOwnerContext(req, res);
    const cart = await getCart({ ...owner, currency: 'INR' });
    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

async function addCartItemHandler(req, res, next) {
  try {
    const { error, value } = addItemSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const owner = getCartOwnerContext(req, res);
    const cart = await addItemToCart(owner, value);

    res.status(201).json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

async function updateCartItemHandler(req, res, next) {
  try {
    const { error, value } = updateItemSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const owner = getCartOwnerContext(req, res);
    const cart = await updateCartItem(owner, req.params.itemId, value);

    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

async function removeCartItemHandler(req, res, next) {
  try {
    const owner = getCartOwnerContext(req, res);
    const cart = await removeCartItem(owner, req.params.itemId);
    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

async function applyCouponHandler(req, res, next) {
  try {
    const { error, value } = couponSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const owner = getCartOwnerContext(req, res);
    const cart = await applyCoupon(owner, value.code);

    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCartHandler,
  addCartItemHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  applyCouponHandler,
};

