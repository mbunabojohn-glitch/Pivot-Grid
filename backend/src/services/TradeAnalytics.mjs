import mongoose from 'mongoose';
import Trade from '../models/Trade.mjs';

function safeNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function riskUnits(trade) {
  const entry = trade.entry ?? trade.entryLimit ?? 0;
  const sl = trade.sl ?? 0;
  const d = Math.abs(safeNumber(entry) - safeNumber(sl));
  return d > 0 ? d : null;
}

export async function analyzeClosedTrades({ filter = {}, sortAscending = true } = {}) {
  const query = { state: 'closed', ...(filter || {}) };
  const proj = { pnl: '$outcome.pnl', entry: 1, entryLimit: 1, sl: 1, closeTime: 1, symbol: 1 };
  const pipeline = [
    { $match: query },
    {
      $project: {
        pnl: { $ifNull: ['$outcome.pnl', 0] },
        entry: { $ifNull: ['$entry', '$entryLimit'] },
        sl: { $ifNull: ['$sl', 0] },
        closeTime: { $ifNull: ['$updatedAt', '$createdAt'] },
        symbol: 1
      }
    },
    { $sort: { closeTime: sortAscending ? 1 : -1 } }
  ];
  const cursor = Trade.aggregate(pipeline).cursor({ batchSize: 1000 }).exec();
  let total = 0;
  let wins = 0;
  let losses = 0;
  let sumWin = 0;
  let sumLossMag = 0;
  let maxConsWins = 0;
  let maxConsLosses = 0;
  let currentWins = 0;
  let currentLosses = 0;
  for await (const t of cursor) {
    const pnl = safeNumber(t.pnl);
    total += 1;
    if (pnl > 0) {
      wins += 1;
      sumWin += pnl;
      currentWins += 1;
      maxConsWins = Math.max(maxConsWins, currentWins);
      currentLosses = 0;
    } else if (pnl < 0) {
      losses += 1;
      sumLossMag += Math.abs(pnl);
      currentLosses += 1;
      maxConsLosses = Math.max(maxConsLosses, currentLosses);
      currentWins = 0;
    } else {
      currentWins = 0;
      currentLosses = 0;
    }
  }
  const totalTrades = total;
  const winRate = totalTrades > 0 ? wins / totalTrades : 0;
  const lossRate = totalTrades > 0 ? losses / totalTrades : 0;
  const avgWin = wins > 0 ? sumWin / wins : 0;
  const avgLoss = losses > 0 ? sumLossMag / losses : 0;
  const expectancy = winRate * avgWin - lossRate * avgLoss;
  const profitFactor = sumLossMag > 0 ? sumWin / sumLossMag : (sumWin > 0 ? Infinity : 0);
  return {
    totalTrades,
    winRate,
    avgWin,
    avgLoss,
    expectancy,
    profitFactor,
    maxConsecutiveLosses: maxConsLosses,
    maxConsecutiveWins: maxConsWins
  };
}
