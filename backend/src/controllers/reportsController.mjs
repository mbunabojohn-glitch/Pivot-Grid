import ea from '../sockets/ea.js';

const { getWeeklySummary } = ea;

export function weeklySummary(req, res) {
  const summary = getWeeklySummary() || { grossPnL: 0, netPnL: 0, clientShare: 0, platformShare: 0 };
  res.json({ summary });
}

export function growthCurve(req, res) {
  res.json({ data: [], message: 'Growth curve stub' });
}
