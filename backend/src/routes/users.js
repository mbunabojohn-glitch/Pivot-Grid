const express = require('express');
const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const User = require('../models/User');

const env = loadEnv();
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email required' });
  const token = jwt.sign({ sub: email, scope: 'client' }, env.JWT_SECRET, {
    expiresIn: '1h',
  });
  res.json({ token });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.get('/', optionalAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

module.exports = router;

