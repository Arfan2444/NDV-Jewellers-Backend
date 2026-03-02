const Joi = require('joi');
const {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  deleteAccount,
} = require('./user.service');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow('', null),
  settings: Joi.object().unknown(true),
});

const addressSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().required(),
  line1: Joi.string().required(),
  line2: Joi.string().allow('', null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().default('IN'),
  isDefault: Joi.boolean().default(false),
});

async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await getCurrentUserProfile(userId);
    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user.id;
    const updated = await updateCurrentUserProfile(userId, value);

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function getMyAddresses(req, res, next) {
  try {
    const userId = req.user.id;
    const addresses = await getAddresses(userId);
    res.json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
}

async function addMyAddress(req, res, next) {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user.id;
    const addresses = await addAddress(userId, value);

    res.status(201).json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
}

async function updateMyAddress(req, res, next) {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const userId = req.user.id;
    const { addressId } = req.params;
    const addresses = await updateAddress(userId, addressId, value);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMyAddress(req, res, next) {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const addresses = await deleteAddress(userId, addressId);

    res.json({
      success: true,
      data: addresses,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    const userId = req.user.id;
    await deleteAccount(userId);
    res.json({
      success: true,
      message: 'Account deleted',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateMe,
  getMyAddresses,
  addMyAddress,
  updateMyAddress,
  deleteMyAddress,
  deleteMe,
};

