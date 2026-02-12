const express = require('express');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
const Trade = require('../models/Trade');
const Account = require('../models/Account');
const { getLatestTrade } = require('../sockets/ea');

const router = express.Router();

router.get('/', optionalAuth, async (req, res) => {
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Trades listing stub', accountId });
});

router.get('/latest', optionalAuth, async (req, res) => {
  const t = getLatestTrade();
  if (!t) return res.json({ trade: null });
  return res.json({ trade: t });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { accountId, symbol, direction, entry } = req.body || {};
    if (!accountId) return res.status(400).json({ error: 'accountId is required' });
    const acc = await Account.findById(accountId);
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    if (acc.tradingLocked) return res.status(423).json({ error: 'Trading is locked due to pending profit split' });
    return res.status(201).json({ message: 'Trade accepted (stub)', accountId, symbol, direction, entry });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to accept trade' });
  }
});

module.exports = router;
