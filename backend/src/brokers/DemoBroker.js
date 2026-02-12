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
    const brokerRefId = `demo-${crypto.createHash('sha1').update(String(idempotencyKey)).digest('hex').slice(0, 16)}`;
    return { ok: true, provider: this.provider, idempotencyKey, accountRef, traderPayout, platformCommission, brokerRefId };
  }
  async fetchSettlementStatements({ since }) {
    return { ok: true, provider: this.provider, statements: [] };
  }
  async getAccountBalance({ userId }) {
    return { ok: true, provider: this.provider, userId, balance: 0, currency: 'USD' };
  }
  async requestWithdrawal(withdrawalRecord) {
    const idempotencyKey = `${withdrawalRecord.accountId}:${withdrawalRecord.traderPayout}:${withdrawalRecord.platformFee}:${Date.now()}`;
    const resp = await this.requestSplitPayout({
      accountRef: withdrawalRecord.accountId,
      traderPayout: withdrawalRecord.traderPayout,
      platformCommission: withdrawalRecord.platformFee,
      idempotencyKey
    });
    return { ok: true, provider: this.provider, brokerRefId: resp.brokerRefId };
  }
  async confirmSettlement(brokerRefId) {
    return { ok: true, provider: this.provider, brokerRefId, status: 'SETTLED' };
  }
  async getSettlementStatement(dateRange) {
    const since = dateRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const resp = await this.fetchSettlementStatements({ since });
    return { ok: true, provider: this.provider, statements: resp.statements || [] };
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
