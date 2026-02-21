import express from 'express';
import authMw from '../middleware/auth.middleware.js';
import WithdrawalRecord from '../models/WithdrawalRecord.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import ProfitSplit from '../models/ProfitSplit.js';
import Account from '../models/Account.js';
import AuditLog from '../models/AuditLog.js';
import LedgerEntry from '../models/LedgerEntry.js';
import splitSvc from '../services/profitSplit.js';
import withdrawSvc from '../services/WithdrawalService.js';
import CommissionReceipt from '../models/CommissionReceipt.js';

const { computeAndRecordProfitSplit } = splitSvc;
const { sendWithdrawalInstruction } = withdrawSvc;

const { requireAuth, optionalAuth } = authMw;
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  if (!req.authUser?.isVerified) return res.status(403).json({ error: 'verification_required' });
  if (req.authUser?.kycStatus !== 'APPROVED') return res.status(403).json({ error: 'kyc_required' });
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Withdrawals listing stub', accountId });
});

async function submitWithdrawal(req, res) {
  if (!req.authUser?.isVerified) return res.status(403).json({ error: 'verification_required' });
  if (req.authUser?.kycStatus !== 'APPROVED') return res.status(403).json({ error: 'kyc_required' });
  const { accountId } = req.body || {};
  if (!accountId) {
    return res.status(400).json({ error: 'accountId is required' });
  }
  let acc;
  let withdrawal;
  try {
    acc = await Account.findById(accountId);
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    if (acc.tradingLocked) return res.status(409).json({ error: 'Trading already locked for this account' });
    const split = await computeAndRecordProfitSplit(accountId);
    const grossProfit = Number(split.grossProfit || 0);
    const clientShare = Number(split.clientShare || 0);
    const platformShare = Number(split.platformShare || 0);
    if (clientShare <= 0) {
      await ProfitSplit.updateOne({ _id: split._id }, { $set: { status: 'CALCULATED' } });
      return res.status(400).json({ error: 'No profit available for withdrawal', profitSplit: { grossProfit, clientShare, platformShare } });
    }
    const idempotencyKey = `${accountId}:${split.periodEnd?.toISOString()}:${grossProfit}`;
    try {
      const instruction = await sendWithdrawalInstruction({ accountId, clientShare, platformShare, idempotencyKey });
      await ProfitSplit.updateOne({ _id: split._id }, { $set: { status: 'AWAITING_SETTLEMENT' } });
      withdrawal = await WithdrawalRecord.create({
        accountId,
        amount: clientShare,
        status: 'processing',
        requestedAt: new Date(),
        note: 'Payout instruction sent to broker: client 80% after platform fee',
        brokerRefId: instruction?.brokerRefId,
        grossProfit,
        platformFee,
        traderPayout: clientShare
      });
      try {
        await LedgerEntry.create({ userId: acc.userId, type: 'WITHDRAWAL', debit: clientShare, credit: 0, referenceId: String(withdrawal._id) });
      } catch {}
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
      await AuditLog.create({
        action: 'withdrawal_instruction_confirmed',
        source: 'backend',
        accountId,
        payload: {
          withdrawalId: withdrawal._id,
          idempotencyKey,
          brokerRefId: instruction?.brokerRefId,
          provider: instruction?.provider
        },
        timestamp: new Date()
      });
      acc.tradingLocked = true;
      acc.lockedAt = new Date();
      await acc.save();
    } catch (err) {
      await ProfitSplit.updateOne({ _id: split._id }, { $set: { status: 'FAILED' } });
      await AuditLog.create({ action: 'withdrawal_instruction_failed', source: 'backend', accountId, payload: { error: String(err) }, timestamp: new Date() });
      return res.status(502).json({ error: 'Broker instruction failed' });
    }
    return res.json({
      withdrawalId: withdrawal._id,
      status: 'processing',
      tradingLocked: acc?.tradingLocked === true,
      profitSplit: {
        week: split.week,
        periodStart: split.periodStart,
        periodEnd: split.periodEnd,
        grossProfit,
        clientShare,
        platformShare,
        status: 'AWAITING_SETTLEMENT'
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to process withdrawal securely' });
  } finally {
    if (acc) {
      try {
        await acc.save();
      } catch {}
    }
  }
}

router.post('/', requireAuth, submitWithdrawal);
router.post('/withdraw', requireAuth, submitWithdrawal);

function toClientStatus(s) {
  const t = String(s || '').toLowerCase();
  if (t === 'pending') return 'PENDING';
  if (t === 'completed') return 'COMPLETED';
  return 'PROCESSING';
}

router.get('/status/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const w = await WithdrawalRecord.findById(id).lean();
    if (!w) return res.status(404).json({ error: 'Withdrawal not found' });
    return res.json({
      withdrawalId: String(w._id),
      brokerRefId: w.brokerRefId || '',
      status: toClientStatus(w.status)
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch withdrawal status' });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const { accountId } = req.query || {};
    if (!accountId) return res.status(400).json({ error: 'accountId is required' });
    const acc = await Account.findById(accountId).lean();
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    const split = await ProfitSplit.findOne({ accountId }).sort({ periodEnd: -1 }).lean();
    if (!split) return res.status(404).json({ error: 'No profit split found' });
    const receipt = await CommissionReceipt.findOne({ accountId, splitRef: split._id }).sort({ settledAt: -1 }).lean();
    return res.json({
      _id: String(split._id),
      userId: String(acc.userId),
      grossProfit: Number(split.grossProfit || 0),
      platformFee: Number(split.platformShare || 0),
      traderPayout: Number(split.clientShare || 0),
      status: split.status,
      brokerRefId: receipt?.brokerRefId || '',
      lockedAt: acc.lockedAt || null,
      settledAt: receipt?.settledAt || null
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch settlement summary' });
  }
});

router.post('/request-by-login', optionalAuth, async (req, res) => {
  try {
    const { mt5Login, amount } = req.body || {};
    const amt = Number(amount || 0);
    if (!mt5Login || !Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: 'mt5Login and positive amount required' });
    }
    const acc = await Account.findOne({ mt5Login }).lean();
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    const reqDoc = await WithdrawalRequest.create({
      accountId: acc._id,
      amount: amt,
      status: 'requested',
      requestedAt: new Date()
    });
    try {
      await AuditLog.create({ action: 'withdrawal_requested', source: 'frontend', accountId: acc._id, payload: { amount: amt }, timestamp: new Date() });
    } catch {}
    return res.json({ requestId: String(reqDoc._id), status: 'requested' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to record withdrawal request' });
  }
});

export default router;
