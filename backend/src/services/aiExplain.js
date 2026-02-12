const { loadEnv } = require('../config/env');
const env = loadEnv();

function fmt(n, digits = 4) {
  if (!Number.isFinite(n)) return 'N/A';
  return Number(n).toFixed(digits);
}

function pct(n, digits = 2) {
  if (!Number.isFinite(n)) return 'N/A';
  return `${(Number(n) * 100).toFixed(digits)}%`;
}

async function explainWithGenkit(trade, logs = []) {
  try {
    const enabled = String(process.env.GENKIT_ENABLED || '').toLowerCase() === 'true';
    if (!enabled) return null;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'pivot-grid';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const model = process.env.GENKIT_MODEL || 'gemini-1.5-flash';
    const prompt = [
      'You are an AI assistant explaining automated trades.',
      'Return a concise, structured explanation with fields:',
      '- entryRationale',
      '- tpReason',
      '- slReason',
      '- summary (short narrative)',
      '',
      `Symbol: ${trade?.symbol} | Direction: ${String(trade?.direction || '').toUpperCase()}`,
      `Entry: ${fmt(trade?.entryLimit)} | SL: ${fmt(trade?.sl)} | TP: ${fmt(trade?.tp)} | Risk%: ${fmt(trade?.riskPct, 2)}`,
      `Entry reason: ${trade?.entryReason || ''}`,
      `State: ${String(trade?.state || '')} | PnL: ${fmt(trade?.result?.pnl, 2)}`,
      'Recent context events:',
      ...(Array.isArray(logs) ? logs.slice(-8).map((l) => `- ${String(l?.action || 'event')} @ ${new Date(l?.timestamp || Date.now()).toISOString()}`) : []),
      '',
      'Explain deterministically based on provided data; avoid speculation beyond signals.',
      'Reply as JSON object with those fields.'
    ].join('\n');
    const { VertexAI } = await import('@google-cloud/vertexai');
    const vertex = new VertexAI({ project: projectId, location });
    const generativeModel = vertex.getGenerativeModel({ model });
    const r = await generativeModel.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }]}]});
    const text = r?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { entryRationale: trade?.entryReason || '', tpReason: '', slReason: '', summary: text || '' };
    }
    const title = 'Trade explanation (Genkit)';
    const combined = [
      `Symbol: ${trade?.symbol} | Direction: ${String(trade?.direction || '').toUpperCase()}`,
      `Entry: ${fmt(trade?.entryLimit)} | SL: ${fmt(trade?.sl)} | TP: ${fmt(trade?.tp)} | Risk per trade: ${pct(Number(trade?.riskPct || 0.05))}`,
      `Entry reason: ${parsed.entryRationale || trade?.entryReason || ''}`,
      parsed.tpReason || '',
      parsed.slReason || '',
      parsed.summary || ''
    ].filter(Boolean).join('\n');
    return { title, text: combined, entryRationale: parsed.entryRationale, tpReason: parsed.tpReason, slReason: parsed.slReason };
  } catch {
    return null;
  }
}

async function explainTrade(trade, logs = []) {
  const dir = String(trade?.direction || '').toUpperCase();
  const symbol = trade?.symbol || 'N/A';
  const entry = trade?.entryLimit;
  const sl = trade?.sl;
  const tp = trade?.tp;
  const riskPct = Number(trade?.riskPct || (env.RISK_PER_TRADE_PCT ? Number(env.RISK_PER_TRADE_PCT) : 0.05));
  const reason = trade?.entryReason || 'Deterministic signal per strategy rules';
  const pnl = trade?.result?.pnl;
  const closed = String(trade?.state || '').toLowerCase() === 'closed';
  const hitTp = closed && Number(pnl || 0) > 0;
  const hitSl = closed && Number(pnl || 0) < 0;
  const entryRationale = reason || 'Deterministic signal per strategy rules';
  const tpReason = hitTp
    ? `Take Profit was reached near ${fmt(tp)} consistent with the target RR (${fmt(trade?.rrTarget || 2.0, 2)}).`
    : 'Trade has not reached TP or is still pending.';
  const slReason = hitSl
    ? `Stop Loss at ${fmt(sl)} was hit due to invalidation conditions or adverse movement beyond risk tolerance.`
    : 'Trade has not hit SL or is still pending.';
  const logNotes =
    Array.isArray(logs) && logs.length
      ? `Context events: ${logs.slice(-5).map((l) => String(l?.action || 'event')).join(', ')}.`
      : 'Context events: none recorded for this trade.';
  const outcomeText =
    pnl == null
      ? 'Outcome pending. Order management will enforce SL/TP and invalidation.'
      : `Outcome recorded: ${pnl >= 0 ? 'profit' : 'loss'} (${fmt(Math.abs(pnl), 2)}).`;
  const genkit = await explainWithGenkit(trade, logs);
  if (genkit) return genkit;
  const base = {
    title: 'Trade explanation',
    text: [
      `Symbol: ${symbol} | Direction: ${dir}`,
      `Entry: ${fmt(entry)} | SL: ${fmt(sl)} | TP: ${fmt(tp)} | Risk per trade: ${pct(riskPct)}`,
      `Entry reason: ${entryRationale}`,
      outcomeText,
      tpReason,
      slReason,
      logNotes,
      'Notes: Strategy uses limit orders, no re-entry after invalidation, and fixed risk parameters.',
    ].join('\n'),
  };
  return { ...base, entryRationale, tpReason, slReason };
}

async function explainDrawdown(snapshotSeries) {
  const maxAllowed = Number(env.MAX_DRAWDOWN_PCT || 0.2); // 20% default
  const series = Array.isArray(snapshotSeries) ? snapshotSeries : [];
  let peak = 0;
  let current = 0;
  for (const s of series) {
    const e = Number(s?.equity || 0);
    if (e > peak) peak = e;
    current = e;
  }
  const dd = peak > 0 ? Math.max(0, (peak - current) / peak) : 0;
  const status =
    dd >= maxAllowed
      ? 'Max drawdown threshold breached. New trades should be paused and open risk reduced.'
      : 'Within drawdown protection. Strategy continues with deterministic risk controls.';
  const trend =
    series.length >= 2 && Number(series[series.length - 1]?.equity || 0) >= Number(series[series.length - 2]?.equity || 0)
      ? 'Recent equity movement shows stabilization or recovery.'
      : 'Recent equity movement shows continued pressure; monitoring continues.';
  return {
    title: 'Drawdown explanation',
    text: [
      `Peak equity: ${fmt(peak, 2)} | Current equity: ${fmt(current, 2)} | Drawdown: ${pct(dd)}`,
      `Policy threshold: ${pct(maxAllowed)}`,
      status,
      trend,
      'Notes: Drawdown is computed from recent equity snapshots; the dashboard remains informational only.',
    ].join('\n'),
  };
}

module.exports = { explainTrade, explainDrawdown };
