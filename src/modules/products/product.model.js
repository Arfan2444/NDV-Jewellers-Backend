const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, index: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, trim: true },
      },
    ],
    metal: { type: String, index: true },
    color: { type: String, index: true },
    occasion: { type: String, index: true },
    style: { type: String, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false, index: true },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'made_to_order'],
      default: 'in_stock',
      index: true,
    },
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;

