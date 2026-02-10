function loadEnv() {
  return {
    PORT: parseInt(process.env.PORT || '4000', 10),
    MONGO_URI:
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pivot_grid',
    JWT_SECRET: process.env.JWT_SECRET || 'change_me',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    PLATFORM_FEE_PCT: parseFloat(process.env.PLATFORM_FEE_PCT || '20'),
    BROKER_WEBHOOK_SECRET: process.env.BROKER_WEBHOOK_SECRET || 'set_broker_webhook_secret',
  };
}

module.exports = { loadEnv };
