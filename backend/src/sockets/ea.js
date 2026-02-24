const AuditLog = require('../models/AuditLog');
const { classifyRegime } = require('../services/MarketRegimeEngine');

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
    if (type === 'ea:trade_opened') {
      const regime = classifyRegime({
        h4Structure: payload.h4Structure,
        h1Continuity: payload.h1Continuity,
        atr: payload.atr,
        atrHigh: payload.atrHigh,
        atrLow: payload.atrLow,
        spread: payload.spread,
        spreadMax: payload.spreadMax
      });
      payload = { ...payload, regime };
      try {
        const Trade = require('../models/Trade');
        const entryVal = payload.entryLimit ?? payload.entry;
        await Trade.updateOne(
          { tradeRef: String(payload.tradeId) },
          {
            $set: {
              tradeRef: String(payload.tradeId),
              symbol: payload.symbol,
              direction: payload.direction,
              entryLimit: entryVal,
              sl: payload.sl,
              tp: payload.tp,
              riskPct: payload.riskPct,
              state: 'pending',
              regime
            }
          },
          { upsert: true }
        );
      } catch {}
    }
    await AuditLog.create({ action: type, source: 'ea', payload, timestamp: new Date() });
  } catch (e) {
    // swallow errors in placeholder mode
  }
}

let latestTrade = null
let weeklySummary = null
let equitySeries = []

function getLatestTrade() {
  return latestTrade
}

function getWeeklySummary() {
  return weeklySummary
}

function getEquitySeries() {
  return equitySeries
}

const { explainTrade } = require('../services/aiExplain');

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
      if (type === 'ea:equity') {
        if (typeof payload.timestamp === 'number' && typeof payload.equity === 'number') {
          equitySeries = [...equitySeries, { t: payload.timestamp, equity: payload.equity }].slice(-200)
        }
      }
      if (type === 'ea:trade_opened') {
      latestTrade = {
          tradeId: payload.tradeId,
          symbol: payload.symbol,
          direction: payload.direction,
          riskPct: payload.riskPct,
          sl: payload.sl,
          tp: payload.tp,
          entryReason: payload.entryReason,
          outcome: payload.result?.pnl ?? '',
          invalidationReason: payload.invalidationReason || ''
        }
      latestTrade.regime = payload.regime;
        try {
          const expl = await explainTrade(latestTrade);
          if (expl && expl.text) wss.broadcast('ai_explanation', expl);
        } catch {}
      } else if (type === 'ea:trade_updated' || type === 'ea:trade_closed') {
        if (latestTrade && latestTrade.tradeId === payload.tradeId) {
          latestTrade = { ...latestTrade, ...payload }
        }
        try {
          const expl = await explainTrade(latestTrade);
          if (expl && expl.text) wss.broadcast('ai_explanation', expl);
        } catch {}
        if (type === 'ea:trade_closed') {
          try {
            const tracking = await import('../services/EquityTracking.mjs');
            const series = getEquitySeries();
            const last = Array.isArray(series) && series.length ? series[series.length - 1] : null;
            const drawdownPct = tracking.computeDrawdownFromSeries(series);
            if (last) {
              await tracking.persistSnapshot({
                accountId: null,
                timestamp: new Date(),
                equity: Number(last.equity || 0),
                balance: Number(last.balance || 0),
                floatingPnL: 0,
                drawdownPercent: drawdownPct
              });
            }
          } catch {}
        }
      } else if (type === 'ea:profit_split') {
        weeklySummary = {
          grossPnL: payload.grossPnL ?? 0,
          netPnL: payload.netPnL ?? 0,
          clientShare: payload.clientShare ?? 0,
          platformShare: payload.platformShare ?? 0,
          period: payload.period
        }
      }
      if (event) wss.broadcast(event, payload);
      return true;
    },
    push(event, payload) {
      wss.broadcast(event, payload);
    },
  };
}

module.exports = { registerEAChannel, getLatestTrade, getWeeklySummary, getEquitySeries };
