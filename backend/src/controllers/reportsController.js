const { getWeeklySummary } = require('../sockets/ea');

function weeklySummary(req, res) {
  const summary = getWeeklySummary() || { grossPnL: 0, netPnL: 0, clientShare: 0, platformShare: 0 };
  res.json({ summary });
}

function growthCurve(req, res) {
  res.json({ data: [], message: 'Growth curve stub' });
}

module.exports = { weeklySummary, growthCurve };
