class BrokerAdapter {
  async requestSplitPayout() {
    throw new Error('not_implemented');
  }
  verifyWebhook() {
    throw new Error('not_implemented');
  }
  async getAccountBalance() {
    throw new Error('not_implemented');
  }
  async requestWithdrawal() {
    throw new Error('not_implemented');
  }
  async confirmSettlement() {
    throw new Error('not_implemented');
  }
  async getSettlementStatement() {
    throw new Error('not_implemented');
  }
}

module.exports = { BrokerAdapter };
