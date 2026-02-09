const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Deposit = require('../models/Deposit');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  res.json({ data: [], message: 'Deposits listing stub' });
});

module.exports = router;

