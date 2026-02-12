const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');
const User = require('../models/User');
const env = loadEnv();

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next();
  try {
    const claims = jwt.verify(token, env.JWT_SECRET);
    req.user = claims;
    const userId = claims?.sub || claims?.id;
    if (userId) {
      User.findById(userId).lean().then((u) => {
        if (u) req.authUser = u;
        next();
      }).catch(() => next());
      return;
    }
  } catch (e) {
    return next();
  }
  next();
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const claims = jwt.verify(token, env.JWT_SECRET);
    req.user = claims;
    const userId = claims?.sub || claims?.id;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });
    User.findById(userId).lean().then((u) => {
      if (!u) return res.status(401).json({ error: 'Invalid token' });
      req.authUser = u;
      return next();
    }).catch(() => res.status(401).json({ error: 'Invalid token' }));
    return;
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  const adminEmail = env.ADMIN_EMAIL || '';
  if (!req.authUser || !adminEmail || String(req.authUser.email).toLowerCase() !== String(adminEmail).toLowerCase()) {
    return res.status(403).json({ error: 'Admins only' });
  }
  return next();
}

function protect(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const claims = jwt.verify(token, env.JWT_SECRET);
    const userId = claims?.id || claims?.sub;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });
    User.findById(userId).lean().then((u) => {
      if (!u) return res.status(401).json({ error: 'Invalid token' });
      req.user = u;
      req.authUser = u;
      return next();
    }).catch(() => res.status(401).json({ error: 'Invalid token' }));
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { optionalAuth, requireAuth, adminOnly, protect };
