const ProfitSplit = require('../models/ProfitSplit');
const WithdrawalRecord = require('../models/WithdrawalRecord');
const CommissionReceipt = require('../models/CommissionReceipt');
const Account = require('../models/Account');
const AuditLog = require('../models/AuditLog');

async function processSettlementEvent(payload) {
  const { event, accountId, splitId, amount, idempotencyKey, periodStart, periodEnd } = payload || {};
  if (!event || !accountId) return { error: 'missing_fields' };
  if (event === 'withdrawal.settled') {
    await WithdrawalRecord.updateOne(
      { accountId, status: { $in: ['pending', 'processing', 'approved', 'completed'] } },
      { $set: { status: 'completed', processedAt: new Date() } }
    );
  } else if (event === 'commission.settled') {
    const splitDoc = await ProfitSplit.findById(splitId).lean();
    const withdrawal = await WithdrawalRecord.findOne({ accountId, status: { $in: ['processing', 'completed'] } })
      .sort({ requestedAt: -1 })
      .lean();
    await CommissionReceipt.updateOne(
      { accountId, splitRef: splitId, idempotencyKey },
      {
        $set: {
          amount,
          periodStart: periodStart ? new Date(periodStart) : undefined,
          periodEnd: periodEnd ? new Date(periodEnd) : undefined,
          status: 'settled',
          settledAt: new Date(),
          withdrawalRef: withdrawal?._id,
          grossProfit: splitDoc?.grossProfit,
          platformFee: splitDoc?.platformShare,
          traderPayout: splitDoc?.clientShare,
          brokerRefId: payload?.brokerRefId
        }
      },
      { upsert: true }
    );
  } else if (event === 'payout.failed' || event === 'commission.failed') {
    await ProfitSplit.updateOne({ _id: splitId }, { $set: { status: 'FAILED' } });
    return { ok: true };
  }
  const split = await ProfitSplit.findById(splitId);
  if (split) {
    const withdrawalDone = await WithdrawalRecord.findOne({ accountId, processedAt: { $exists: true } }).lean();
    const commissionDone = await CommissionReceipt.findOne({ accountId, splitRef: splitId, status: 'settled' }).lean();
    if (withdrawalDone && commissionDone) {
      await ProfitSplit.updateOne({ _id: splitId }, { $set: { status: 'SETTLED' } });
      const acc = await Account.findById(accountId);
      if (acc) {
        acc.tradingLocked = false;
        await acc.save();
      }
    }
  }
  return { ok: true };
}

async function processBrokerRefSettlement(payload) {
  const { brokerRefId, status, amount } = payload || {};
  if (!brokerRefId || !status) return { error: 'missing_fields' };
  const withdrawal = await WithdrawalRecord.findOne({ brokerRefId }).lean();
  if (!withdrawal) return { error: 'unknown_broker_ref' };
  const accountId = withdrawal.accountId;
  const normalizedStatus = String(status).toUpperCase();
  if (withdrawal.status === 'completed') {
    return { ok: true, duplicate: true };
  }
  const receiptExisting = await CommissionReceipt.findOne({ brokerRefId, status: 'settled' }).lean();
  if (receiptExisting) {
    return { ok: true, duplicate: true };
  }
  const expectedAmount = Number(withdrawal.amount || 0);
  const actualAmount = Number(amount || 0);
  if (Number.isFinite(actualAmount) && Math.abs(actualAmount - expectedAmount) > 0.00001) {
    await AuditLog.create({
      action: 'broker_settlement_amount_mismatch',
      source: 'backend',
      accountId,
      payload: { brokerRefId, expectedAmount, actualAmount },
      timestamp: new Date(),
    });
    return { error: 'amount_mismatch' };
  }
  if (normalizedStatus === 'SETTLED') {
    await WithdrawalRecord.updateOne({ _id: withdrawal._id }, { $set: { status: 'completed', processedAt: new Date() } });
    const splitDoc = await ProfitSplit.findOne({ accountId, status: 'AWAITING_SETTLEMENT' }).sort({ periodEnd: -1 }).lean();
    const splitId = splitDoc?._id;
    await CommissionReceipt.updateOne(
      { accountId, splitRef: splitId, brokerRefId },
      {
        $set: {
          amount,
          status: 'settled',
          settledAt: new Date(),
          withdrawalRef: withdrawal._id,
          grossProfit: splitDoc?.grossProfit,
          platformFee: splitDoc?.platformShare,
          traderPayout: splitDoc?.clientShare,
          brokerRefId
        }
      },
      { upsert: true }
    );
    if (splitId) {
      const commissionDone = await CommissionReceipt.findOne({ accountId, splitRef: splitId, status: 'settled' }).lean();
      const withdrawalDone = await WithdrawalRecord.findOne({ _id: withdrawal._id, processedAt: { $exists: true } }).lean();
      if (withdrawalDone && commissionDone) {
        await ProfitSplit.updateOne({ _id: splitId }, { $set: { status: 'SETTLED' } });
        const acc = await Account.findById(accountId);
        if (acc) {
          acc.tradingLocked = false;
          await acc.save();
        }
      }
    }
    return { ok: true, settled: true };
  }
  return { ok: true, accepted: true };
}

module.exports = { processSettlementEvent, processBrokerRefSettlement };
