const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Account = require('../models/Account');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  res.json({ data: [], message: 'Accounts listing stub' });
});

router.post('/', requireAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;

