const express = require('express');
const { requireAuth } = require('../middleware/auth');
const WithdrawalRecord = require('../models/WithdrawalRecord');
const ProfitSplit = require('../models/ProfitSplit');
const Account = require('../models/Account');
const AuditLog = require('../models/AuditLog');
const { computeAndRecordProfitSplit } = require('../services/profitSplit');
const { adapter } = require('../integrations/brokerAdapter');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Withdrawals listing stub', accountId });
});

router.post('/', requireAuth, async (req, res) => {
  const { accountId } = req.body || {};
  if (!accountId) {
    return res.status(400).json({ error: 'accountId is required' });
  }
  let acc;
  try {
    acc = await Account.findById(accountId);
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    if (acc.tradingLocked) return res.status(409).json({ error: 'Trading already locked for this account' });
    acc.tradingLocked = true;
    await acc.save();
    const split = await computeAndRecordProfitSplit(accountId);
    const grossProfit = Number(split.grossProfit || 0);
    const clientShare = Number(split.clientShare || 0);
    const platformShare = Number(split.platformShare || 0);
    if (clientShare <= 0) {
      await ProfitSplit.updateOne({ _id: split._id }, { $set: { status: 'calculated' } });
      return res.status(400).json({ error: 'No profit available for withdrawal', profitSplit: { grossProfit, clientShare, platformShare } });
    }
    const idempotencyKey = `${accountId}:${split.periodEnd?.toISOString()}:${grossProfit}`;
    const withdrawal = await WithdrawalRecord.create({
      accountId,
      amount: clientShare,
      status: 'processing',
      requestedAt: new Date(),
      note: 'Payout instruction sent to broker: client 80% after platform fee'
    });
    await AuditLog.create({
      action: 'withdrawal_instruction_sent',
      source: 'backend',
      accountId,
      payload: {
        withdrawalId: withdrawal._id,
        grossProfit,
        platformFeePct: undefined,
        platformShare,
        traderPayout: clientShare
      },
      timestamp: new Date()
    });
    await adapter.requestSplitPayout({
      accountRef: accountId,
      traderPayout: clientShare,
      platformCommission: platformShare,
      idempotencyKey
    });
    return res.json({
      withdrawalId: withdrawal._id,
      status: 'processing',
      profitSplit: {
        week: split.week,
        periodStart: split.periodStart,
        periodEnd: split.periodEnd,
        grossProfit,
        clientShare,
        platformShare,
        status: 'calculated'
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to process withdrawal securely' });
  } finally {
    if (acc) {
      try {
        await acc.save();
      } catch (_) {}
    }
  }
});

module.exports = router;
