import EquitySnapshot from '../models/EquitySnapshot.mjs';

export function computeDrawdownFromSeries(series = []) {
  let peak = 0;
  let dd = 0;
  for (const s of series) {
    const e = Number(s?.equity || s?.payload?.equity || s?.equity ?? 0);
    if (!Number.isFinite(e)) continue;
    if (e > peak) peak = e;
    if (peak > 0) {
      const cur = Math.max(0, (peak - e) / peak);
      if (cur > dd) dd = cur;
    }
  }
  return dd;
}

export async function persistSnapshot({ accountId = null, timestamp = new Date(), equity = 0, balance = 0, floatingPnL = 0, drawdownPercent = 0 }) {
  const doc = {
    accountId,
    equity: Number(equity) || 0,
    balance: Number(balance) || 0,
    floatingPnL: Number(floatingPnL) || 0,
    drawdownPercent: Number(drawdownPercent) || 0,
    timestamp: timestamp instanceof Date ? timestamp : new Date(timestamp)
  };
  try {
    await EquitySnapshot.create(doc);
    return true;
  } catch {
    return false;
  }
}
