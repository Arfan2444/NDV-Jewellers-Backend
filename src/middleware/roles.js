function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      return next(error);
    }
    return next();
  };
}

module.exports = requireRole;

