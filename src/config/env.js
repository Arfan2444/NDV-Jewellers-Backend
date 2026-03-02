const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "change_this_access_secret",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "change_this_refresh_secret",
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },
};

module.exports = config;
