const express = require('express');
const ProfitSplit = require('../models/ProfitSplit');
const WithdrawalRecord = require('../models/WithdrawalRecord');
const CommissionReceipt = require('../models/CommissionReceipt');
const Account = require('../models/Account');
const AuditLog = require('../models/AuditLog');
const { adapter } = require('../integrations/brokerAdapter');

const router = express.Router();

router.post('/broker', express.raw({ type: '*/*' }), async (req, res) => {
  const raw = req.body;
  if (!adapter.verifyWebhook(req.headers, raw)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }
  let payload;
  try {
    payload = JSON.parse(raw.toString());
  } catch {
    return res.status(400).json({ error: 'invalid_json' });
  }
  const { event, accountId, splitId, amount, idempotencyKey, periodStart, periodEnd } = payload || {};
  if (!event || !accountId) return res.status(400).json({ error: 'missing_fields' });
  try {
    await AuditLog.create({ action: `broker_webhook:${event}`, source: 'backend', accountId, payload, timestamp: new Date() });
    if (event === 'withdrawal.settled') {
      await WithdrawalRecord.updateOne(
        { accountId, status: { $in: ['pending', 'approved', 'completed'] } },
        { $set: { status: 'completed', processedAt: new Date() } }
      );
    } else if (event === 'commission.settled') {
      await CommissionReceipt.updateOne(
        { accountId, splitRef: splitId, idempotencyKey },
        {
          $set: {
            amount,
            periodStart: periodStart ? new Date(periodStart) : undefined,
            periodEnd: periodEnd ? new Date(periodEnd) : undefined,
            status: 'settled',
            settledAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    const split = await ProfitSplit.findById(splitId);
    if (split) {
      const withdrawalDone = await WithdrawalRecord.findOne({ accountId, processedAt: { $exists: true } }).lean();
      const commissionDone = await CommissionReceipt.findOne({ accountId, splitRef: splitId, status: 'settled' }).lean();
      if (withdrawalDone && commissionDone) {
        await ProfitSplit.updateOne({ _id: splitId }, { $set: { status: 'distributed' } });
        const acc = await Account.findById(accountId);
        if (acc) {
          acc.tradingLocked = false;
          await acc.save();
        }
      }
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'webhook_processing_failed' });
  }
});

module.exports = router;
