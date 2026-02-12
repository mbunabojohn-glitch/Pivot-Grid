const express = require('express');
const { optionalAuth, requireAuth } = require('../middleware/auth.middleware');
const Auth = require('../controllers/authController');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { loadEnv } = require('../config/env');
const env = loadEnv();

const router = express.Router();

router.post('/signup', Auth.signup);
router.post('/login', Auth.login);
router.post('/logout', requireAuth, Auth.logout);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'google_auth_failed' });
    const accessToken = jwt.sign(
      { sub: String(user._id), email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { sub: String(user._id), type: 'refresh' },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({
      user: { id: String(user._id), email: user.email, role: user.role, isVerified: user.isVerified },
      accessToken,
      refreshToken,
    });
  })(req, res, next);
});

module.exports = router;
