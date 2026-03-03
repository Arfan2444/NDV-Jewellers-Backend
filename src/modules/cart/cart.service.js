const Cart = require('./cart.model');
const Product = require('../products/product.model');

function recalculateCart(cart) {
  let subtotal = 0;

  cart.items.forEach((item) => {
    subtotal += item.quantity * item.unitPriceAtAddTime;
  });

  cart.subtotal = subtotal;
  cart.discounts = cart.discounts || 0;
  cart.tax = cart.tax || 0;
  cart.shippingFee = cart.shippingFee || 0;
  cart.total = subtotal - cart.discounts + cart.tax + cart.shippingFee;

  return cart;
}

async function getOrCreateCart({ userId, sessionId, currency }) {
  const query = {};
  if (userId) {
    query.user = userId;
  } else if (sessionId) {
    query.sessionId = sessionId;
  } else {
    const error = new Error('Cart owner not specified');
    error.statusCode = 400;
    throw error;
  }

  let cart = await Cart.findOne(query);

  if (!cart) {
    cart = await Cart.create({
      ...query,
      currency: currency || 'INR',
      items: [],
      subtotal: 0,
      discounts: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
    });
  }

  return cart;
}

async function getCart(options) {
  const cart = await Cart.findOne({
    ...(options.userId ? { user: options.userId } : {}),
    ...(options.sessionId ? { sessionId: options.sessionId } : {}),
  }).populate('items.product');

  if (!cart) {
    return {
      items: [],
      subtotal: 0,
      discounts: 0,
      tax: 0,
      shippingFee: 0,
      total: 0,
      currency: options.currency || 'INR',
    };
  }

  return cart;
}

async function addItemToCart(options, { productId, quantity, size, metal, color }) {
  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  const cart = await getOrCreateCart(options);

  const existingItem = cart.items.find(
    (item) =>
      String(item.product) === String(productId) &&
      item.selectedSize === size &&
      item.selectedMetal === metal &&
      item.selectedColor === color
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      selectedSize: size,
      selectedMetal: metal,
      selectedColor: color,
      unitPriceAtAddTime: product.price,
    });
  }

  recalculateCart(cart);
  await cart.save();

  return cart.populate('items.product');
}

async function updateCartItem(options, itemId, { quantity, size, metal, color }) {
  const cart = await getOrCreateCart(options);

  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  if (quantity !== undefined) {
    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
    }
  }

  if (size !== undefined) {
    item.selectedSize = size;
  }

  if (metal !== undefined) {
    item.selectedMetal = metal;
  }

  if (color !== undefined) {
    item.selectedColor = color;
  }

  recalculateCart(cart);
  await cart.save();

  return cart.populate('items.product');
}

async function removeCartItem(options, itemId) {
  const cart = await getOrCreateCart(options);

  const item = cart.items.id(itemId);
  if (!item) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  item.deleteOne();

  recalculateCart(cart);
  await cart.save();

  return cart.populate('items.product');
}

async function applyCoupon(options, code) {
  const cart = await getOrCreateCart(options);

  cart.appliedCoupon = code;
  // Placeholder: real discount logic can be added later based on code.
  cart.discounts = 0;

  recalculateCart(cart);
  await cart.save();

  return cart.populate('items.product');
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  applyCoupon,
};

