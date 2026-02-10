const { BrokerAdapter } = require('./BrokerAdapter');

class MT5Broker extends BrokerAdapter {
  constructor() {
    super();
    this.provider = 'mt5-broker';
  }
  async requestSplitPayout() {
    return { ok: true, provider: this.provider };
  }
  verifyWebhook() {
    return true;
  }
}

module.exports = { MT5Broker };
