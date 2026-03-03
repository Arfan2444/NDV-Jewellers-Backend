const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const config = require('./config/env');
const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const wishlistRoutes = require('./modules/wishlist/wishlist.routes');

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    })
  );
  app.use(logger());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);

  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'API is healthy',
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;

