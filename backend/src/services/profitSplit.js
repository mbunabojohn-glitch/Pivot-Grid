const ProfitSplit = require('../models/ProfitSplit')
const { computeGrossProfit } = require('./ProfitCalculator')
const { getFeeFraction } = require('./FeePolicy')
const Account = require('../models/Account')
const LedgerEntry = require('../models/LedgerEntry')

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
  const normalizedGross = await computeGrossProfit(accountId, periodStart, periodEnd)
  const platformFeeFrac = getFeeFraction({ accountId, grossProfit: normalizedGross, now: periodEnd })
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
    status: 'CALCULATED'
  })
  try {
    const acc = await Account.findById(accountId).lean()
    const userId = acc?.userId
    if (userId) {
      if (normalizedGross > 0) {
        await LedgerEntry.create({ userId, type: 'PROFIT', debit: 0, credit: normalizedGross, referenceId: String(split._id) })
      }
      if (platformShare > 0) {
        await LedgerEntry.create({ userId, type: 'PLATFORM_FEE', debit: platformShare, credit: 0, referenceId: String(split._id) })
      }
    }
  } catch (_) {}
  return split
}

module.exports = { computeAndRecordProfitSplit }
