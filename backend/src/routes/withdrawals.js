const express = require('express');
const { requireAuth } = require('../middleware/auth');
const WithdrawalRecord = require('../models/WithdrawalRecord');
const ProfitSplit = require('../models/ProfitSplit');
const Account = require('../models/Account');
const { computeAndRecordProfitSplit } = require('../services/profitSplit');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Withdrawals listing stub', accountId });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { accountId, amount } = req.body || {};
    if (!accountId || typeof amount !== 'number') {
      return res.status(400).json({ error: 'accountId and numeric amount are required' });
    }
    const acc = await Account.findById(accountId);
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    if (acc.tradingLocked) return res.status(409).json({ error: 'Trading already locked for this account' });
    acc.tradingLocked = true;
    await acc.save();
    const withdrawal = await WithdrawalRecord.create({
      accountId,
      amount,
      status: 'pending',
      requestedAt: new Date()
    });
    const split = await computeAndRecordProfitSplit(accountId);
    await ProfitSplit.updateOne({ _id: split._id }, { $set: { status: 'distributed' } });
    acc.tradingLocked = false;
    await acc.save();
    return res.json({
      withdrawalId: withdrawal._id,
      requestedAmount: withdrawal.amount,
      profitSplit: {
        week: split.week,
        periodStart: split.periodStart,
        periodEnd: split.periodEnd,
        grossProfit: split.grossProfit,
        clientShare: split.clientShare,
        platformShare: split.platformShare,
        status: 'distributed'
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to request withdrawal and compute profit split' });
  }
});

module.exports = router;
