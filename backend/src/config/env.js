const dotenv = require('dotenv');
dotenv.config();

function loadEnv() {
  return {
    PORT: parseInt(process.env.PORT || '4000', 10),
    MONGO_URI:
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pivot_grid',
    JWT_SECRET: process.env.JWT_SECRET || 'change_me',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    BROKER_API_KEY: process.env.BROKER_API_KEY || '',
    BROKER_PROVIDER: process.env.BROKER_PROVIDER || 'demo',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    PLATFORM_FEE_PCT: parseFloat(process.env.PLATFORM_FEE_PCT || '20'),
    BROKER_WEBHOOK_SECRET: process.env.BROKER_WEBHOOK_SECRET || 'set_broker_webhook_secret',
    RECONCILE_INTERVAL_MS: parseInt(process.env.RECONCILE_INTERVAL_MS || '300000', 10),
    FEE_POLICY_FILE: process.env.FEE_POLICY_FILE || '',
    FEE_POLICY_RELOAD_MS: parseInt(process.env.FEE_POLICY_RELOAD_MS || '300000', 10),
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
    SMTP_HOST: process.env.SMTP_HOST || '',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    SMTP_SECURE: process.env.SMTP_SECURE || 'false',
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER || '',
    EMAIL_VERIFY_BASE_URL: process.env.EMAIL_VERIFY_BASE_URL || 'http://localhost:4000/api/auth/verify-email',
    REFRESH_TOKEN_ENC_KEY: process.env.REFRESH_TOKEN_ENC_KEY || process.env.JWT_REFRESH_SECRET || '',
    BROKER_WEBHOOK_SECRETS: process.env.BROKER_WEBHOOK_SECRETS || '',
  };
}

module.exports = { loadEnv };
