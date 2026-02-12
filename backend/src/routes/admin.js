const express = require('express')
const { requireAuth, adminOnly } = require('../middleware/auth.middleware')
const User = require('../models/User')
const WithdrawalRecord = require('../models/WithdrawalRecord')
const CommissionReceipt = require('../models/CommissionReceipt')
const Account = require('../models/Account')
const AuditLog = require('../models/AuditLog')

const router = express.Router()

// IP logging for all admin requests
router.use(requireAuth, adminOnly, async (req, res, next) => {
  try {
    await AuditLog.create({
      action: 'admin_request',
      source: 'backend',
      accountId: null,
      payload: { path: req.originalUrl, ip: req.clientIp, requestId: req.requestId, userId: req.authUser?._id },
      timestamp: new Date()
    })
  } catch (_) {}
  next()
})

router.get('/users', requireAuth, adminOnly, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200)
  const users = await User.find({}, { email: 1, googleId: 1, tradingLocked: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(limit).lean()
  res.json({ data: users })
})

router.get('/withdrawals', requireAuth, adminOnly, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200)
  const list = await WithdrawalRecord.find({}, { accountId: 1, amount: 1, status: 1, requestedAt: 1, processedAt: 1, brokerRefId: 1, grossProfit: 1, platformFee: 1, traderPayout: 1 }).sort({ requestedAt: -1 }).limit(limit).lean()
  res.json({ data: list })
})

router.get('/commissions', requireAuth, adminOnly, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 200)
  const list = await CommissionReceipt.find({}, { accountId: 1, amount: 1, status: 1, settledAt: 1, splitRef: 1, brokerRefId: 1, grossProfit: 1, platformFee: 1, traderPayout: 1 }).sort({ settledAt: -1, createdAt: -1 }).limit(limit).lean()
  res.json({ data: list })
})

router.post('/lock-user', requireAuth, adminOnly, async (req, res) => {
  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  await User.updateOne({ _id: userId }, { $set: { tradingLocked: true } })
  await Account.updateMany({ userId }, { $set: { tradingLocked: true, lockedAt: new Date() } })
  res.json({ ok: true })
})

router.post('/unlock-user', requireAuth, adminOnly, async (req, res) => {
  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId is required' })
  await User.updateOne({ _id: userId }, { $set: { tradingLocked: false } })
  await Account.updateMany({ userId }, { $set: { tradingLocked: false, lockedAt: null } })
  res.json({ ok: true })
})

router.get('/settlement-report', requireAuth, adminOnly, async (req, res) => {
  const { brokerRefId, withdrawalId } = req.query || {}
  if (!brokerRefId && !withdrawalId) return res.status(400).json({ error: 'brokerRefId or withdrawalId required' })
  let receipt = null
  if (brokerRefId) {
    receipt = await CommissionReceipt.findOne({ brokerRefId }).lean()
  }
  if (!receipt && withdrawalId) {
    receipt = await CommissionReceipt.findOne({ withdrawalRef: withdrawalId }).lean()
    if (!receipt) {
      const w = await WithdrawalRecord.findById(withdrawalId).lean()
      if (w?.brokerRefId) {
        receipt = await CommissionReceipt.findOne({ brokerRefId: w.brokerRefId }).lean()
      }
    }
  }
  if (!receipt) return res.status(404).json({ error: 'not_found' })
  const acc = await Account.findById(receipt.accountId).lean()
  const userId = acc?.userId ? String(acc.userId) : null
  const withdrawalIdOut = receipt.withdrawalRef ? String(receipt.withdrawalRef) : ''
  const grossProfit = Number(receipt.grossProfit || 0)
  const platformFee = Number(receipt.platformFee || 0)
  const traderPayout = Number(receipt.traderPayout || 0)
  const feePercentage = grossProfit > 0 ? Number(((platformFee / grossProfit) * 100).toFixed(2)) : 0
  const settledAt = receipt.settledAt || null
  let reconciliationStatus = 'UNKNOWN'
  const audit = await AuditLog.findOne({ 'payload.brokerRefId': receipt.brokerRefId }).sort({ timestamp: -1 }).lean()
  if (audit?.action === 'reconciliation_matched') {
    reconciliationStatus = 'MATCHED'
  } else if (audit?.action === 'reconciliation_mismatch') {
    reconciliationStatus = 'MISMATCH'
  }
  return res.json({
    withdrawalId: withdrawalIdOut,
    userId,
    brokerRefId: receipt.brokerRefId || '',
    grossProfit,
    feePercentage,
    platformFee,
    traderPayout,
    settledAt,
    reconciliationStatus
  })
})

module.exports = router
