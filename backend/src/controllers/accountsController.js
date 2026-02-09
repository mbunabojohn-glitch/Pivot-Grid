function listAccounts(req, res) {
  res.json({ data: [], message: 'Accounts listing stub' });
}

function createAccount(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

module.exports = { listAccounts, createAccount };

