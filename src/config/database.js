const mongoose = require('mongoose');
const config = require('./env');

async function connectDatabase() {
  try {
    await mongoose.connect(config.mongoUri, {
      // options can be customized if needed
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected 🌿');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = connectDatabase;

