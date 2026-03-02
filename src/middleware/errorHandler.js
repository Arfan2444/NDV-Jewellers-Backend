function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = {
  notFound,
  errorHandler,
};

