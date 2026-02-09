function weeklySummary(req, res) {
  res.json({ data: {}, message: 'Weekly summary stub' });
}

function growthCurve(req, res) {
  res.json({ data: [], message: 'Growth curve stub' });
}

module.exports = { weeklySummary, growthCurve };

