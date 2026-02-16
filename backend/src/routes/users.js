const express = require('express');
const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');
const { requireAuth, optionalAuth } = require('../middleware/auth.middleware');
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

router.get('/me', requireAuth, async (req, res) => {
  try {
    const u = req.authUser;
    if (!u) return res.status(404).json({ error: 'user_not_found' });
    return res.json({
      user: {
        id: String(u._id),
        email: u.email,
        tradingLocked: Boolean(u.tradingLocked),
        createdAt: u.createdAt || null,
        updatedAt: u.updatedAt || null
      }
    });
  } catch (e) {
    return res.status(500).json({ error: 'failed_to_load_user' });
  }
});

router.get('/', optionalAuth, async (req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});

router.post('/test-create', optionalAuth, async (req, res) => {
  try {
    const email = (req.body && req.body.email) || `test_${Date.now()}@example.com`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, tradingLocked: false });
    }
    res.status(201).json({ id: String(user._id), email: user.email });
  } catch (e) {
    res.status(500).json({ error: 'create_failed', message: e.message });
  }
});

router.get('/test-list', optionalAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt((req.query && req.query.limit) || '5', 10), 50);
    const list = await User.find({}, { email: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ data: list });
  } catch (e) {
    res.status(500).json({ error: 'list_failed', message: e.message });
  }
});

router.delete('/test/:id', optionalAuth, async (req, res) => {
  try {
    const id = String(req.params.id || '');
    if (!id) return res.status(400).json({ error: 'id required' });
    const r = await User.deleteOne({ _id: id });
    res.json({ deleted: r.deletedCount === 1 });
  } catch (e) {
    res.status(500).json({ error: 'delete_failed', message: e.message });
  }
});

module.exports = router;
