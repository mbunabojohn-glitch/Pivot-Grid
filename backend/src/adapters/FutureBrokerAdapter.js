const { BrokerAdapter } = require('../brokers/BrokerAdapter')

class FutureBrokerAdapter extends BrokerAdapter {
  constructor() {
    super()
    this.provider = 'future-broker'
  }
  async requestSplitPayout({ accountRef, traderPayout, platformCommission, idempotencyKey }) {
    const brokerRefId = `future-${Date.now().toString(36)}-${(idempotencyKey || '').slice(0, 8)}`
    return { ok: true, provider: this.provider, idempotencyKey, accountRef, traderPayout, platformCommission, brokerRefId }
  }
  async fetchSettlementStatements({ since }) {
    return { ok: true, provider: this.provider, statements: [] }
  }
  async getAccountBalance({ userId }) {
    return { ok: true, provider: this.provider, userId, balance: 0, currency: 'USD' }
  }
  async requestWithdrawal(withdrawalRecord) {
    const idempotencyKey = `${withdrawalRecord.accountId}:${withdrawalRecord.traderPayout}:${withdrawalRecord.platformFee}:${Date.now()}`
    const resp = await this.requestSplitPayout({
      accountRef: withdrawalRecord.accountId,
      traderPayout: withdrawalRecord.traderPayout,
      platformCommission: withdrawalRecord.platformFee,
      idempotencyKey
    })
    return { ok: true, provider: this.provider, brokerRefId: resp.brokerRefId }
  }
  async confirmSettlement(brokerRefId) {
    return { ok: true, provider: this.provider, brokerRefId, status: 'SETTLED' }
  }
  async getSettlementStatement(dateRange) {
    const since = dateRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1000)
    const resp = await this.fetchSettlementStatements({ since })
    return { ok: true, provider: this.provider, statements: resp.statements || [] }
  }
  verifyWebhook() {
    return true
  }
}

module.exports = { FutureBrokerAdapter }
