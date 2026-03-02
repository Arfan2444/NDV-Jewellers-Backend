const Joi = require('joi');
const {
  listProducts,
  getProductBySlug,
  getFeaturedProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('./product.service');

const productCreateSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().required(),
  description: Joi.string().allow('', null),
  category: Joi.string().required(),
  subcategory: Joi.string().allow('', null),
  price: Joi.number().required(),
  discountPercent: Joi.number().min(0).max(100).default(0),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().allow('', null),
      })
    )
    .default([]),
  metal: Joi.string().allow('', null),
  color: Joi.string().allow('', null),
  occasion: Joi.string().allow('', null),
  style: Joi.string().allow('', null),
  isBestSeller: Joi.boolean().default(false),
  isNew: Joi.boolean().default(false),
  stockStatus: Joi.string().valid('in_stock', 'low_stock', 'out_of_stock', 'made_to_order').default('in_stock'),
  seo: Joi.object({
    title: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    keywords: Joi.array().items(Joi.string()),
  }).default({}),
});

async function getProducts(req, res, next) {
  try {
    const result = await listProducts(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await getProductBySlug(req.params.slug);
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function getFeatured(req, res, next) {
  try {
    const items = await getFeaturedProducts(req.query);
    res.json({
      success: true,
      items,
    });
  } catch (err) {
    next(err);
  }
}

async function getCategories(req, res, next) {
  try {
    const categories = await listCategories();
    res.json({
      success: true,
      items: categories,
    });
  } catch (err) {
    next(err);
  }
}

async function createProductController(req, res, next) {
  try {
    const { error, value } = productCreateSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const product = await createProduct(value);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProductController(req, res, next) {
  try {
    const { error, value } = productCreateSchema.min(1).validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const product = await updateProduct(req.params.id, value);
    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteProductController(req, res, next) {
  try {
    await deleteProduct(req.params.id);
    res.json({
      success: true,
      message: 'Product deleted',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProduct,
  getFeatured,
  getCategories,
  createProductController,
  updateProductController,
  deleteProductController,
};

