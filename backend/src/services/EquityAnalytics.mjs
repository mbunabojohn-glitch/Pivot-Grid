import EquitySnapshot from '../models/EquitySnapshot.mjs';

function dayKey(ts) {
  const d = ts instanceof Date ? ts : new Date(ts);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function analyzeEquity({ accountId = null, start = null, end = null } = {}) {
  const match = {};
  if (accountId) match.accountId = accountId;
  if (start || end) {
    match.timestamp = {};
    if (start) match.timestamp.$gte = start instanceof Date ? start : new Date(start);
    if (end) match.timestamp.$lte = end instanceof Date ? end : new Date(end);
  }
  const pipeline = [
    { $match: match },
    { $project: { equity: 1, balance: 1, drawdownPercent: 1, timestamp: 1 } },
    { $sort: { timestamp: 1 } }
  ];
  const cursor = EquitySnapshot.aggregate(pipeline).cursor({ batchSize: 2000 }).exec();

  // Max historical drawdown across entire series
  let peak = 0;
  let maxDD = 0;

  // Build last snapshot per day for simplified daily returns
  const lastByDay = new Map();
  for await (const s of cursor) {
    const e = Number(s.equity || 0);
    if (e > peak) peak = e;
    if (peak > 0) {
      const dd = Math.max(0, (peak - e) / peak);
      if (dd > maxDD) maxDD = dd;
    }
    const key = dayKey(s.timestamp);
    const prev = lastByDay.get(key);
    if (!prev || new Date(s.timestamp).getTime() >= new Date(prev.timestamp).getTime()) {
      lastByDay.set(key, { equity: e, timestamp: s.timestamp });
    }
  }

  // Daily volatility and Sharpe
  const days = Array.from(lastByDay.entries()).sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
  const equities = days.map(([, v]) => Number(v.equity || 0));
  const returns = [];
  for (let i = 1; i < equities.length; i++) {
    const prev = equities[i - 1];
    const cur = equities[i];
    if (prev > 0 && Number.isFinite(cur) && Number.isFinite(prev)) {
      returns.push((cur - prev) / prev);
    }
  }
  const n = returns.length;
  const mean = n ? returns.reduce((s, r) => s + r, 0) / n : 0;
  const variance = n
    ? returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) / n
    : 0;
  const std = Math.sqrt(variance);
  const equityVolatility = std;
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;

  return {
    maxHistoricalDrawdown: maxDD,
    equityVolatility,
    sharpeRatioDaily: sharpe
  };
}
