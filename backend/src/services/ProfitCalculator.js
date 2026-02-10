const Trade = require('../models/Trade');

async function computeGrossProfit(accountId, periodStart, periodEnd) {
  const trades = await Trade.find({
    accountId,
    state: 'closed',
    createdAt: { $gt: periodStart, $lte: periodEnd }
  }).lean();
  const gross = trades.reduce((sum, t) => sum + (t?.outcome?.pnl || 0), 0);
  return Math.max(0, Number(gross) || 0);
}

module.exports = { computeGrossProfit };
