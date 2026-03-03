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

async function optionalAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next();
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    return next();
  } catch (err) {
    return next();
  }
}

module.exports = optionalAuth;

