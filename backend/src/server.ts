import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  process.exit(1);
});

let server;
try {
  server = app.listen(env.PORT, () => {
    logger.info(`🚀 API listening on http://localhost:${env.PORT}`);
  });
} catch (error) {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
}

const shutdown = (signal: string) => {
  logger.info(`${signal} received. Closing server...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
};

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, () => shutdown(signal));
});

