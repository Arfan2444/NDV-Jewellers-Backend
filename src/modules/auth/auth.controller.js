const Joi = require('joi');
const { registerUser, loginUser, getMe } = require('./auth.service');
const { verifyRefreshToken, signAccessToken, signRefreshToken } = require('../../utils/jwt');

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

function setAuthCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  const commonOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  res.cookie('access_token', accessToken, {
    ...commonOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refresh_token', refreshToken, {
    ...commonOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res) {
  const isProd = process.env.NODE_ENV === 'production';
  const commonOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  res.clearCookie('access_token', commonOptions);
  res.clearCookie('refresh_token', commonOptions);
}

async function register(req, res, next) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const { user, accessToken, refreshToken } = await registerUser(value);

    setAuthCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const { user, accessToken, refreshToken } = await loginUser(value);

    setAuthCookies(res, accessToken, refreshToken);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearAuthCookies(res);
    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token =
      req.cookies?.refresh_token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      const error = new Error('Refresh token missing');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyRefreshToken(token);

    const payload = { sub: decoded.sub, role: decoded.role };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed',
    });
  } catch (err) {
    err.statusCode = err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' ? 401 : err.statusCode;
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await getMe(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  me,
};

