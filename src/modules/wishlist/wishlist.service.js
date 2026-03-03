const User = require('../users/user.model');
const { addItemToCart } = require('../cart/cart.service');

async function getWishlist(userId) {
  const user = await User.findById(userId).populate('wishlist');
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.wishlist || [];
}

async function addToWishlist(userId, productId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const exists = user.wishlist.some((id) => String(id) === String(productId));
  if (!exists) {
    user.wishlist.push(productId);
    await user.save();
  }

  return getWishlist(userId);
}

async function removeFromWishlist(userId, productId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.wishlist = user.wishlist.filter((id) => String(id) !== String(productId));
  await user.save();

  return getWishlist(userId);
}

async function moveToCartFromWishlist(userId, { productId, quantity, size, metal, color }) {
  await removeFromWishlist(userId, productId);

  const cart = await addItemToCart(
    { userId },
    {
      productId,
      quantity: quantity || 1,
      size,
      metal,
      color,
    }
  );

  return cart;
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCartFromWishlist,
};

