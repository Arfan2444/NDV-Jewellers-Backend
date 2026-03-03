const Joi = require('joi');
const { registerAdminUser, loginUser } = require('../auth/auth.service');
const { setAuthCookies, clearAuthCookies } = require('../auth/auth.controller');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

async function adminRegister(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const { user, accessToken, refreshToken } = await registerAdminUser(value);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const { user, accessToken, refreshToken } = await loginUser(value);

    if (user.role !== 'admin') {
      const err = new Error('Admin access only');
      err.statusCode = 403;
      throw err;
    }

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function adminLogout(req, res, next) {
  try {
    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Admin logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminRegister,
  adminLogin,
  adminLogout,
};

