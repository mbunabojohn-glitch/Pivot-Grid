export function listTrades(req, res) {
  res.json({ data: [], message: 'Trades listing stub' });
}

export function createTrade(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

import { analyzeClosedTrades } from '../services/TradeAnalytics.mjs';

export async function analytics(req, res) {
  try {
    const stats = await analyzeClosedTrades({});
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: 'analytics_failed' });
  }
}
