const User = require('../modules/users/user.model');
const { verifyAccessToken } = require('../utils/jwt');

function getTokenFromRequest(req) {
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }

  return null;
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.sub);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      err.statusCode = 401;
      err.message = 'Invalid or expired token';
    }
    next(err);
  }
}

module.exports = requireAuth;

