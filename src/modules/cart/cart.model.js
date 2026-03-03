const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedSize: { type: String },
    selectedMetal: { type: String },
    selectedColor: { type: String },
    unitPriceAtAddTime: { type: Number, required: true },
  },
  {
    _id: true,
    timestamps: true,
  }
);

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    currency: { type: String, default: 'INR' },
    items: [CartItemSchema],
    subtotal: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    appliedCoupon: { type: String },
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;

