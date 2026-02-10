const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');
const { adapter } = require('../integrations/brokerAdapter');
const { processSettlementEvent } = require('../services/SettlementService');

async function handle(req, res) {
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
  const headerEventId = req.headers['x-event-id'] || req.headers['X-Event-Id'];
  if (!headerEventId) {
    return res.status(400).json({ error: 'missing_event_id' });
  }
  const eventId = headerEventId;
  const existing = await AuditLog.findOne({ eventId }).lean();
  if (existing) {
    return res.json({ ok: true, duplicate: true });
  }
  await AuditLog.create({
    action: `broker_webhook:${payload.event}`,
    source: 'backend',
    accountId: payload.accountId,
    eventId,
    payload,
    timestamp: new Date()
  });
  const result = await processSettlementEvent(payload);
  return res.json(result);
}

module.exports = { handle }
