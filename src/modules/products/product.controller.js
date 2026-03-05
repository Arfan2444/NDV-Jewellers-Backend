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
const { uploadProductImage } = require('../../utils/s3');

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
    const body = { ...req.body };

    // If images metadata is sent as JSON string, parse it
    if (typeof body.images === 'string') {
      try {
        body.images = JSON.parse(body.images);
      } catch (e) {
        body.images = [];
      }
    }

    // Ensure images is an array
    if (!Array.isArray(body.images)) {
      body.images = [];
    }

    // Parse SEO if sent as JSON string in form-data
    if (typeof body.seo === 'string') {
      try {
        body.seo = JSON.parse(body.seo);
      } catch (e) {
        body.seo = {};
      }
    }

    const { error, value } = productCreateSchema.validate(body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const files = Array.isArray(req.files) ? req.files : [];

    // Upload any provided images to S3 and build the images array
    const uploadedImages = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const url = await uploadProductImage({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      });

      const altFromBody =
        Array.isArray(value.images) && value.images[i] && value.images[i].alt
          ? value.images[i].alt
          : undefined;

      uploadedImages.push({
        url,
        alt: altFromBody || file.originalname || '',
      });
    }

    const productPayload = {
      ...value,
      images: uploadedImages.length > 0 ? uploadedImages : value.images,
    };

    const product = await createProduct(productPayload);
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
    const body = { ...req.body };

    if (typeof body.images === 'string') {
      try {
        body.images = JSON.parse(body.images);
      } catch (e) {
        body.images = undefined;
      }
    }

    if (typeof body.seo === 'string') {
      try {
        body.seo = JSON.parse(body.seo);
      } catch (e) {
        body.seo = undefined;
      }
    }

    const { error, value } = productCreateSchema.min(1).validate(body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const uploadedImages = [];

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const url = await uploadProductImage({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      });

      const altFromBody =
        Array.isArray(value.images) && value.images[i] && value.images[i].alt
          ? value.images[i].alt
          : undefined;

      uploadedImages.push({
        url,
        alt: altFromBody || file.originalname || '',
      });
    }

    const updatePayload = {
      ...value,
    };

    if (uploadedImages.length > 0) {
      updatePayload.images = uploadedImages;
    }

    const product = await updateProduct(req.params.id, updatePayload);
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

