const Joi = require('joi');
const { getWishlist, addToWishlist, removeFromWishlist, moveToCartFromWishlist } = require('./wishlist.service');

const wishlistItemSchema = Joi.object({
  productId: Joi.string().required(),
});

const moveToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1),
  size: Joi.string().allow('', null),
  metal: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
});

async function getWishlistHandler(req, res, next) {
  try {
    const items = await getWishlist(req.user.id);
    res.json({
      success: true,
      items,
    });
  } catch (err) {
    next(err);
  }
}

async function addWishlistItemHandler(req, res, next) {
  try {
    const { error, value } = wishlistItemSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const items = await addToWishlist(req.user.id, value.productId);
    res.status(201).json({
      success: true,
      items,
    });
  } catch (err) {
    next(err);
  }
}

async function removeWishlistItemHandler(req, res, next) {
  try {
    const productId = req.params.productId;
    const items = await removeFromWishlist(req.user.id, productId);
    res.json({
      success: true,
      items,
    });
  } catch (err) {
    next(err);
  }
}

async function moveToCartHandler(req, res, next) {
  try {
    const { error, value } = moveToCartSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const cart = await moveToCartFromWishlist(req.user.id, value);

    res.json({
      success: true,
      data: cart,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWishlistHandler,
  addWishlistItemHandler,
  removeWishlistItemHandler,
  moveToCartHandler,
};

