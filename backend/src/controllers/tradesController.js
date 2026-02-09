function listTrades(req, res) {
  res.json({ data: [], message: 'Trades listing stub' });
}

function createTrade(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

module.exports = { listTrades, createTrade };

