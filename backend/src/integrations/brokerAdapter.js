const crypto = require('crypto');
const { loadEnv } = require('../config/env');

class BrokerAdapter {
  constructor() {
    const env = loadEnv();
    this.webhookSecret = env.BROKER_WEBHOOK_SECRET;
    this.provider = 'mock-broker';
  }

  async requestSplitPayout({ accountRef, traderPayout, platformCommission, idempotencyKey }) {
    // Placeholder integration: In production, call broker API with partner commission facility.
    return { ok: true, idempotencyKey, provider: this.provider };
  }

  verifyWebhook(headers, rawBody) {
    // HMAC SHA256 verification using shared secret
    try {
      const signature = headers['x-broker-signature'] || headers['X-Broker-Signature'];
      if (!signature) return false;
      const h = crypto.createHmac('sha256', this.webhookSecret);
      h.update(rawBody);
      const digest = `sha256=${h.digest('hex')}`;
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

const adapter = new BrokerAdapter();
module.exports = { adapter, BrokerAdapter };
