const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { accountId } = req.query || {};
  res.json({ data: [], message: 'Withdrawals listing stub', accountId });
});

router.post('/', requireAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;

