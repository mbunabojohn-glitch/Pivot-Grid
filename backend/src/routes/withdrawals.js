const express = require('express');
const { requireAuth } = require('../middleware/auth');
const WithdrawalRecord = require('../models/WithdrawalRecord');
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
    const withdrawal = await WithdrawalRecord.create({
      accountId,
      amount,
      status: 'pending',
      requestedAt: new Date()
    });
    const split = await computeAndRecordProfitSplit(accountId);
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
        status: split.status
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to request withdrawal and compute profit split' });
  }
});

module.exports = router;
