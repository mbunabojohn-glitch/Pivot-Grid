class BrokerAdapter {
  async requestSplitPayout() {
    throw new Error('not_implemented');
  }
  verifyWebhook() {
    throw new Error('not_implemented');
  }
}

module.exports = { BrokerAdapter };
