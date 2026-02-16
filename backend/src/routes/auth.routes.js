const express = require('express');
const passport = require('passport');
const { requireAuth } = require('../middleware/auth.middleware');
const Auth = require('../controllers/auth.controller');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');

const router = express.Router();

router.post('/signup', Auth.signup);
router.post('/login', Auth.login);
router.post('/logout', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/exchange', express.json(), async (req, res) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: 'missing_id_token' });
    const fetchUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const resp = await fetch(fetchUrl);
    if (!resp.ok) return res.status(401).json({ error: 'invalid_id_token' });
    const info = await resp.json();
    const env = require('../config/env').loadEnv();
    const audOk = info?.aud && env.FIREBASE_PROJECT_ID && String(info.aud) === String(env.FIREBASE_PROJECT_ID);
    const issOk = info?.iss && env.FIREBASE_PROJECT_ID && String(info.iss).includes(env.FIREBASE_PROJECT_ID);
    if (env.FIREBASE_PROJECT_ID && !(audOk || issOk)) {
      return res.status(401).json({ error: 'aud_mismatch' });
    }
    const email = info?.email || '';
    const uid = info?.user_id || info?.sub || '';
    if (!email && !uid) return res.status(401).json({ error: 'invalid_payload' });
    const User = require('../models/User');
    let user = null;
    if (email) user = await User.findOne({ email });
    if (!user && uid) user = await User.findOne({ googleId: uid });
    if (!user) {
      user = await User.create({
        email: email || `${uid}@users.local`,
        googleId: uid || undefined,
        tradingLocked: false
      });
    } else if (uid && !user.googleId) {
      user.googleId = uid;
      await user.save();
    }
    const { generateAccessToken, generateRefreshToken } = require('../services/token.service');
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    return res.json({
      user: { id: String(user._id), email: user.email },
      accessToken,
      refreshToken
    });
  } catch (e) {
    return res.status(500).json({ error: 'exchange_failed' });
  }
});
router.post('/kyc/start', requireAuth, async (req, res) => {
  try {
    const provider = String((req.body && req.body.provider) || '').toLowerCase();
    if (!['smile', 'verifyme', 'dojah'].includes(provider)) {
      return res.status(400).json({ error: 'unsupported_provider' });
    }
    const crypto = require('crypto');
    const referenceId = crypto.randomBytes(16).toString('hex');
    const User = require('../models/User');
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    user.kycStatus = 'PENDING';
    user.kycProvider = provider;
    user.kycReferenceId = referenceId;
    await user.save();
    const providerStartUrls = {
      smile: `https://portal.smileidentity.com/verify?ref=${referenceId}`,
      verifyme: `https://app.verifyme.ng/verify?ref=${referenceId}`,
      dojah: `https://kyc.dojah.io/verify?ref=${referenceId}`
    };
    const redirectUrl = providerStartUrls[provider];
    return res.json({ provider, referenceId, redirectUrl });
  } catch (e) {
    return res.status(500).json({ error: 'kyc_start_failed' });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user) return res.status(401).json({ error: 'google_auth_failed' });
    try {
      const accessToken = generateAccessToken(user);
      const refreshToken = await generateRefreshToken(user);
      return res.json({
        user: { id: String(user._id), email: user.email },
        accessToken,
        refreshToken,
      });
    } catch (e) {
      return res.status(500).json({ error: 'token_issue_failed' });
    }
  })(req, res, next);
});

module.exports = router;
