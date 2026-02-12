const { adapter } = require('../integrations/brokerAdapter')

async function sendWithdrawalInstruction({ accountId, clientShare, platformShare, idempotencyKey }) {
  const resp = await adapter.requestSplitPayout({
    accountRef: accountId,
    traderPayout: clientShare,
    platformCommission: platformShare,
    idempotencyKey
  })
  return resp
}

module.exports = { sendWithdrawalInstruction }
