const express = require('express');
const { optionalAuth } = require('../middleware/auth.middleware');
const { getLatestTrade, getEquitySeries } = require('../sockets/ea');
const { explainTrade, explainDrawdown } = require('../services/aiExplain');
const AuditLog = require('../models/AuditLog');
const Trade = require('../models/Trade');

const router = express.Router();

router.get('/explain', optionalAuth, async (req, res) => {
  const t = getLatestTrade();
  if (!t) return res.json({ title: 'AI Assistant', text: 'No recent trade to explain.' });
  const result = await explainTrade(t);
  res.json(result || { title: 'AI Assistant', text: 'Explanation unavailable.' });
});

router.get('/explain/:tradeId', optionalAuth, async (req, res) => {
  try {
    const tradeId = String(req.params.tradeId || '');
    if (!tradeId) return res.status(400).json({ error: 'tradeId required' });
    let trade = await Trade.findById(tradeId).lean();
    const logs = await AuditLog.find({ 'payload.tradeId': tradeId }).sort({ timestamp: 1 }).lean();
    if (!trade && logs.length) {
      const open = logs.find((l) => String(l.action || '').includes('trade_opened'));
      const closed = logs.slice().reverse().find((l) => String(l.action || '').includes('trade_closed'));
      const updated = logs.filter((l) => String(l.action || '').includes('trade_updated'));
      const base = open?.payload || {};
      trade = {
        _id: tradeId,
        symbol: base.symbol,
        direction: base.direction,
        entryLimit: base.entryLimit ?? base.entry,
        sl: base.sl,
        tp: base.tp,
        riskPct: base.riskPct ?? base.riskPercent,
        state: closed ? 'closed' : 'pending',
        result: closed?.payload?.result || updated.slice(-1)[0]?.payload?.result,
        entryReason: base.entryReason,
        rrTarget: base.rrTarget,
      };
    }
    if (!trade) return res.status(404).json({ error: 'trade_not_found' });
    const result = await explainTrade(trade, logs);
    return res.json(result || { title: 'AI Assistant', text: 'Explanation unavailable.' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

router.get('/drawdown', optionalAuth, async (req, res) => {
  const series = getEquitySeries();
  const result = await explainDrawdown(Array.isArray(series) ? series : []);
  res.json(result || { title: 'Drawdown', text: 'No drawdown data available.' });
});

module.exports = router;
