const CommissionReceipt = require('../models/CommissionReceipt');
const AuditLog = require('../models/AuditLog');
const { loadEnv } = require('../config/env');

async function runOnce(adapter, since) {
  try {
    const resp = await adapter.fetchSettlementStatements({ since });
    const statements = Array.isArray(resp?.statements) ? resp.statements : [];
    const byRef = new Map();
    for (const s of statements) {
      if (s?.brokerRefId) byRef.set(String(s.brokerRefId), s);
    }
    const receipts = await CommissionReceipt.find({
      settledAt: { $gte: since },
      brokerRefId: { $exists: true, $ne: null },
      status: 'settled',
    }).lean();
    for (const r of receipts) {
      const refId = String(r.brokerRefId || '');
      const statement = byRef.get(refId);
      if (!statement) {
        await AuditLog.create({
          action: 'reconciliation_mismatch',
          source: 'backend',
          accountId: r.accountId,
          payload: {
            type: 'missing_statement',
            commissionReceiptId: r._id,
            brokerRefId: refId,
            expectedAmount: r.amount,
          },
          timestamp: new Date(),
        });
        continue;
      }
      const expected = Number(r.amount || 0);
      const actual = Number(statement.amount || 0);
      if (Number.isFinite(expected) && Number.isFinite(actual) && Math.abs(expected - actual) < 0.00001) {
        await AuditLog.create({
          action: 'reconciliation_matched',
          source: 'backend',
          accountId: r.accountId,
          payload: {
            commissionReceiptId: r._id,
            brokerRefId: refId,
            amount: actual,
            provider: statement.provider,
          },
          timestamp: new Date(),
        });
      } else {
        await AuditLog.create({
          action: 'reconciliation_mismatch',
          source: 'backend',
          accountId: r.accountId,
          payload: {
            type: 'amount_mismatch',
            commissionReceiptId: r._id,
            brokerRefId: refId,
            expectedAmount: expected,
            statementAmount: actual,
            provider: statement.provider,
          },
          timestamp: new Date(),
        });
      }
    }
  } catch (e) {
    await AuditLog.create({
      action: 'reconciliation_error',
      source: 'backend',
      payload: { error: String(e) },
      timestamp: new Date(),
    });
  }
}

function scheduleReconciliation(adapter, intervalMs) {
  const env = loadEnv();
  const interval = Number.isFinite(intervalMs) ? intervalMs : Number(env.RECONCILE_INTERVAL_MS || 300000);
  const sinceWindowMs = 24 * 60 * 60 * 1000;
  setInterval(() => {
    const since = new Date(Date.now() - sinceWindowMs);
    runOnce(adapter, since);
  }, interval);
}

module.exports = { scheduleReconciliation, runOnce };
