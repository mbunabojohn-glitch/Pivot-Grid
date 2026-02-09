function listAccounts(req, res) {
  res.json({ data: [], message: 'Accounts listing stub' });
}

function createAccount(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

function getSummary(req, res) {
  const { id } = req.params;
  res.json({
    accountId: id,
    summary: {
      balance: 0,
      equity: 0,
      drawdownPercent: 0,
      openTrades: 0,
    },
    message: 'Account summary stub',
  });
}

module.exports = { listAccounts, createAccount, getSummary };
