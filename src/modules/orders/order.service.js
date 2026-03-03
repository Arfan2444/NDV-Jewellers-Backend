const Order = require('./order.model');
const Cart = require('../cart/cart.model');
const User = require('../users/user.model');
const Product = require('../products/product.model');

function computeShippingAndTax(subtotal) {
  const shippingFee = subtotal >= 10000 ? 0 : 199;
  const tax = Math.round(subtotal * 0.18);
  const discount = 0;
  const total = subtotal - discount + tax + shippingFee;

  return {
    subtotal,
    discount,
    tax,
    shippingFee,
    total,
  };
}

async function buildOrderPreview({ userId, cartId }) {
  let cart;

  if (cartId) {
    cart = await Cart.findOne({ _id: cartId, user: userId }).populate('items.product');
  } else {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  }

  if (!cart || !cart.items.length) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  const productIds = cart.items.map((item) => item.product._id || item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const validationErrors = [];

  cart.items.forEach((item) => {
    const product = productMap.get(String(item.product._id || item.product));
    if (!product) {
      validationErrors.push({
        itemId: item.id,
        reason: 'PRODUCT_NOT_FOUND',
      });
      return;
    }
    if (product.stockStatus === 'out_of_stock') {
      validationErrors.push({
        itemId: item.id,
        reason: 'OUT_OF_STOCK',
      });
    }
  });

  const totals = computeShippingAndTax(cart.subtotal || 0);

  return {
    cartId: cart.id,
    items: cart.items,
    totals,
    currency: cart.currency || 'INR',
    validationErrors,
    shippingOptions: [
      {
        id: 'standard',
        label: 'Standard Delivery',
        fee: totals.shippingFee,
        estimatedDays: 7,
      },
    ],
  };
}

async function placeOrder({ userId, cartId, shippingAddress, billingAddress, paymentMethod, paymentDetails }) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  let cart;
  if (cartId) {
    cart = await Cart.findOne({ _id: cartId, user: userId }).populate('items.product');
  } else {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  }

  if (!cart || !cart.items.length) {
    const error = new Error('Cart is empty');
    error.statusCode = 400;
    throw error;
  }

  const totals = computeShippingAndTax(cart.subtotal || 0);

  const orderItems = cart.items.map((item) => ({
    product: item.product._id || item.product,
    nameSnapshot: item.product.name,
    priceSnapshot: item.unitPriceAtAddTime,
    quantity: item.quantity,
    variant: {
      size: item.selectedSize,
      metal: item.selectedMetal,
      color: item.selectedColor,
    },
  }));

  const order = await Order.create({
    user: userId,
    items: orderItems,
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    shippingFee: totals.shippingFee,
    total: totals.total,
    currency: cart.currency || 'INR',
    status: 'placed',
    paymentStatus: 'paid',
    paymentMethod,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    placedAt: new Date(),
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    meta: {
      paymentDetails: paymentDetails || { simulated: true },
    },
  });

  cart.items = [];
  cart.subtotal = 0;
  cart.discounts = 0;
  cart.tax = 0;
  cart.shippingFee = 0;
  cart.total = 0;
  await cart.save();

  return order;
}

async function listOrders({ userId, status, page = 1, limit = 20 }) {
  const filters = { user: userId };
  if (status) {
    filters.status = status;
  }

  const pageNum = Number(page) > 0 ? Number(page) : 1;
  const limitNum = Number(limit) > 0 && Number(limit) <= 100 ? Number(limit) : 20;
  const skip = (pageNum - 1) * limitNum;

  const [items, total] = await Promise.all([
    Order.find(filters).sort({ placedAt: -1, createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(filters),
  ]);

  return {
    items,
    total,
    page: pageNum,
    pageSize: limitNum,
  };
}

async function getOrderById({ userId, orderId }) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    const error = new Error('Order not found');
    error.statusCode = 404;
    throw error;
  }
  return order;
}

module.exports = {
  buildOrderPreview,
  placeOrder,
  listOrders,
  getOrderById,
};

