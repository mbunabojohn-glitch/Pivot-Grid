export function listWithdrawals(req, res) {
  res.json({ data: [], message: 'Withdrawals listing stub (tracking only)' });
}

export function requestWithdrawal(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}
