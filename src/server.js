const http = require('http');
const config = require('./config/env');
const connectDatabase = require('./config/database');
const createApp = require('./app');

async function startServer() {
  await connectDatabase();

  const app = createApp();
  const server = http.createServer(app);

  const PORT = config.port;

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT} in ${config.env} mode. ✅`);
  });

  const shutdown = () => {
    // eslint-disable-next-line no-console
    console.log('Shutting down server...');
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});

