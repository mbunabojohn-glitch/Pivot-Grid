import regimeMod from './MarketRegimeEngine.js';
const { classifyRegime } = regimeMod;

function atrSeries(candles, period = 14) {
  const out = [];
  let prevClose = null;
  const tr = [];
  for (const c of candles) {
    if (prevClose == null) {
      prevClose = c.close;
      out.push(0);
      continue;
    }
    const t = Math.max(
      Math.abs(c.high - c.low),
      Math.abs(c.high - prevClose),
      Math.abs(c.low - prevClose)
    );
    tr.push(t);
    if (tr.length > period) tr.shift();
    const atr = tr.length ? tr.reduce((s, v) => s + v, 0) / tr.length : 0;
    out.push(atr);
    prevClose = c.close;
  }
  return out;
}

function fibLevels(start, end) {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const range = max - min;
  return {
    f50: min + range * 0.5,
    f618: min + range * 0.618
  };
}

export function backtest({ candles = [], config = {} } = {}) {
  const rrTarget = Number(config.rrTarget ?? 2.0);
  const atrPeriod = Number(config.atrPeriod ?? 14);
  const atrHi = Number(config.atrHigh ?? 0);
  const atrLo = Number(config.atrLow ?? 0);
  const spread = Number(config.spread ?? 0);
  const spreadMax = Number(config.spreadMax ?? 0.0005);
  const atr = atrSeries(candles, atrPeriod);
  const trades = [];
  let impulseDir = null;
  let impulseStart = null;
  let impulseEnd = null;
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const a = atr[i];
    if (!impulseDir) {
      const prev = candles[i - 1];
      const moveUp = c.close - prev.close;
      if (Math.abs(moveUp) > a) {
        impulseDir = moveUp > 0 ? 'UP' : 'DOWN';
        impulseStart = prev.close;
        impulseEnd = c.close;
        continue;
      }
    } else {
      impulseEnd = impulseDir === 'UP' ? Math.max(impulseEnd, c.close) : Math.min(impulseEnd, c.close);
      const levels = fibLevels(impulseStart, impulseEnd);
      if (impulseDir === 'UP') {
        const entry = Math.min(levels.f618, levels.f50);
        if (c.low <= entry && c.high >= entry) {
          const sl = Math.min(c.low, entry - a);
          const risk = entry - sl;
          const tp = entry + rrTarget * risk;
          let closed = false;
          for (let j = i; j < candles.length; j++) {
            const cj = candles[j];
            if (cj.low <= sl) {
              trades.push({ entry, sl, tp, pnl: -risk, closeTime: cj.time, direction: 'BUY' });
              closed = true;
              break;
            }
            if (cj.high >= tp) {
              trades.push({ entry, sl, tp, pnl: rrTarget * risk, closeTime: cj.time, direction: 'BUY' });
              closed = true;
              break;
            }
          }
          if (!closed) {
            const last = candles[candles.length - 1];
            const pnl = last.close - entry;
            trades.push({ entry, sl, tp, pnl, closeTime: last.time, direction: 'BUY' });
          }
          impulseDir = null;
          impulseStart = null;
          impulseEnd = null;
        }
      } else {
        const entry = Math.max(levels.f618, levels.f50);
        if (c.low <= entry && c.high >= entry) {
          const sl = Math.max(c.high, entry + a);
          const risk = sl - entry;
          const tp = entry - rrTarget * risk;
          let closed = false;
          for (let j = i; j < candles.length; j++) {
            const cj = candles[j];
            if (cj.high >= sl) {
              trades.push({ entry, sl, tp, pnl: -risk, closeTime: cj.time, direction: 'SELL' });
              closed = true;
              break;
            }
            if (cj.low <= tp) {
              trades.push({ entry, sl, tp, pnl: rrTarget * risk, closeTime: cj.time, direction: 'SELL' });
              closed = true;
              break;
            }
          }
          if (!closed) {
            const last = candles[candles.length - 1];
            const pnl = entry - last.close;
            trades.push({ entry, sl, tp, pnl, closeTime: last.time, direction: 'SELL' });
          }
          impulseDir = null;
          impulseStart = null;
          impulseEnd = null;
        }
      }
    }
  }
  const results = [];
  for (const t of trades) {
    const regime = classifyRegime({
      h4Structure: t.direction === 'BUY' ? 'HHHL' : 'LLLH',
      h1Continuity: 'CONTINUOUS',
      atr: atrPeriod ? atrPeriod : 0,
      atrHigh: atrHi,
      atrLow: atrLo,
      spread,
      spreadMax
    });
    results.push({ ...t, regime });
  }
  return { trades: results };
}
