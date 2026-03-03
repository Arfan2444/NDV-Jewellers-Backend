const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const path = require("path");
const config = require("./config/env");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const productRoutes = require("./modules/products/product.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const wishlistRoutes = require("./modules/wishlist/wishlist.routes");
const checkoutRoutes = require("./modules/orders/checkout.routes");
const ordersRoutes = require("./modules/orders/orders.routes");
const customRoutes = require("./modules/custom-orders/customOrders.routes");
const accountRoutes = require("./modules/account/account.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const adminAuthRoutes = require("./modules/admin/adminAuth.routes");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.clientUrl,
      credentials: true,
    }),
  );
  app.use(logger());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/wishlist", wishlistRoutes);
  app.use("/api/checkout", checkoutRoutes);
  app.use("/api/orders", ordersRoutes);
  app.use("/api/custom", customRoutes);
  app.use("/api/account", accountRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/admin/auth", adminAuthRoutes);

  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "API is healthy",
    });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;