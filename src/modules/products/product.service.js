const Product = require('./product.model');
const Category = require('./category.model');

function buildProductFilters(query) {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  const multiValueFields = ['style', 'metal', 'color', 'occasion'];
  multiValueFields.forEach((field) => {
    if (query[field]) {
      const values = Array.isArray(query[field]) ? query[field] : String(query[field]).split(',');
      filters[field] = { $in: values };
    }
  });

  if (query.priceRange) {
    const range = Array.isArray(query.priceRange)
      ? query.priceRange
      : String(query.priceRange).split(',').map((v) => v.trim());
    const [min, max] = range.map((v) => Number(v));
    filters.price = {};
    if (!Number.isNaN(min)) {
      filters.price.$gte = min;
    }
    if (!Number.isNaN(max)) {
      filters.price.$lte = max;
    }
    if (Object.keys(filters.price).length === 0) {
      delete filters.price;
    }
  }

  if (query.search) {
    const regex = new RegExp(String(query.search), 'i');
    filters.$or = [{ name: regex }, { description: regex }];
  }

  return filters;
}

function buildProductSort(sort) {
  if (!sort) return { createdAt: -1 };

  switch (sort) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'newest':
      return { createdAt: -1 };
    case 'bestseller':
      return { isBestSeller: -1, createdAt: -1 };
    default:
      return { createdAt: -1 };
  }
}

async function listProducts(query) {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 && Number(query.limit) <= 100 ? Number(query.limit) : 20;
  const skip = (page - 1) * limit;

  const filters = buildProductFilters(query);
  const sort = buildProductSort(query.sort);

  const [items, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(filters),
  ]);

  return {
    items,
    total,
    page,
    pageSize: limit,
  };
}

async function getProductBySlug(slug) {
  const product = await Product.findOne({ slug });
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function getFeaturedProducts(query) {
  const filters = {};

  if (query.category) {
    filters.category = query.category;
  }

  filters.$or = [{ isBestSeller: true }, { isNew: true }];

  const limit = Number(query.limit) > 0 && Number(query.limit) <= 50 ? Number(query.limit) : 12;

  const items = await Product.find(filters).sort({ isBestSeller: -1, createdAt: -1 }).limit(limit);

  return items;
}

async function listCategories() {
  const categories = await Category.find().sort({ name: 1 });
  return categories;
}

async function createProduct(data) {
  const product = await Product.create(data);
  return product;
}

async function updateProduct(id, data) {
  const product = await Product.findByIdAndUpdate(id, data, { new: true });
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
}

module.exports = {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};

