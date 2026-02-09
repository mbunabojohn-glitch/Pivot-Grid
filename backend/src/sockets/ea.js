const AuditLog = require('../models/AuditLog');

function validate(type, payload) {
  if (!payload || typeof payload !== 'object') return false;
  switch (type) {
    case 'ea:equity':
      return typeof payload.equity === 'number';
    case 'ea:drawdown':
      return typeof payload.drawdownPct === 'number';
    case 'ea:trade_opened':
      return !!payload.tradeId && !!payload.symbol && !!payload.direction;
    case 'ea:trade_updated':
    case 'ea:trade_closed':
      return !!payload.tradeId;
    case 'ea:audit':
      return !!payload.message;
    case 'ea:profit_split':
      return typeof payload.clientShare === 'number' && typeof payload.platformShare === 'number';
    case 'ea:ai_explanation':
      return !!payload.title && !!payload.text;
    default:
      return false;
  }
}

async function storeLog(type, payload) {
  try {
    await AuditLog.create({
      action: type,
      source: 'ea',
      payload,
      timestamp: new Date(),
    });
  } catch (e) {
    // swallow errors in placeholder mode
  }
}

function registerEAChannel(wss) {
  return {
    async handle(type, payload) {
      const ok = validate(type, payload);
      if (!ok) return false;
      await storeLog(type, payload);
      const map = {
        'ea:equity': 'equity_update',
        'ea:drawdown': 'drawdown_update',
        'ea:trade_opened': 'trade_opened',
        'ea:trade_updated': 'trade_updated',
        'ea:trade_closed': 'trade_closed',
        'ea:audit': 'audit_event',
        'ea:profit_split': 'profit_split_ready',
        'ea:ai_explanation': 'ai_explanation',
      };
      const event = map[type];
      if (event) wss.broadcast(event, payload);
      return true;
    },
    push(event, payload) {
      wss.broadcast(event, payload);
    },
  };
}

module.exports = { registerEAChannel };
