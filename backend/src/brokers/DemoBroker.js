const crypto = require('crypto');
const { loadEnv } = require('../config/env');
const { BrokerAdapter } = require('./BrokerAdapter');

class DemoBroker extends BrokerAdapter {
  constructor() {
    super();
    const env = loadEnv();
    this.webhookSecret = env.BROKER_WEBHOOK_SECRET;
    this.provider = 'demo-broker';
  }
  async requestSplitPayout({ accountRef, traderPayout, platformCommission, idempotencyKey }) {
    return { ok: true, provider: this.provider, idempotencyKey, accountRef, traderPayout, platformCommission };
  }
  verifyWebhook(headers, rawBody) {
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

module.exports = { DemoBroker };
