const express = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const Account = require('../models/Account');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  res.json({ data: [], message: 'Accounts listing stub' });
});

router.post('/', requireAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.get('/:id/summary', requireAuth, async (req, res) => {
  const { getSummary } = require('../controllers/accountsController');
  return getSummary(req, res);
});

module.exports = router;
