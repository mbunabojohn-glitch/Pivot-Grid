const ProfitSplit = require('../models/ProfitSplit')
const Trade = require('../models/Trade')
const { loadEnv } = require('../config/env')

function isoWeekString(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

async function computeAndRecordProfitSplit(accountId) {
  const latest = await ProfitSplit.findOne({ accountId }).sort({ periodEnd: -1 }).lean()
  const periodStart = latest?.periodEnd ? new Date(latest.periodEnd) : new Date(0)
  const periodEnd = new Date()
  const trades = await Trade.find({
    accountId,
    state: 'closed',
    createdAt: { $gt: periodStart, $lte: periodEnd }
  }).lean()
  const grossProfit = trades.reduce((sum, t) => sum + (t?.outcome?.pnl || 0), 0)
  const normalizedGross = Math.max(0, Number(grossProfit) || 0)
  const env = loadEnv()
  const platformFeeFrac = Math.min(1, Math.max(0, (env.PLATFORM_FEE_PCT || 20) / 100))
  const clientShare = Number((normalizedGross * (1 - platformFeeFrac)).toFixed(2))
  const platformShare = Number((normalizedGross * platformFeeFrac).toFixed(2))
  const split = await ProfitSplit.create({
    accountId,
    week: isoWeekString(periodEnd),
    periodStart,
    periodEnd,
    grossProfit: normalizedGross,
    clientShare,
    platformShare,
    status: 'calculated'
  })
  return split
}

module.exports = { computeAndRecordProfitSplit }
