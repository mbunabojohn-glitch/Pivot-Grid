const express = require('express');
const passport = require('passport');
const { requireAuth } = require('../middleware/auth.middleware');
const Auth = require('../controllers/auth.controller');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');

const router = express.Router();

router.post('/signup', Auth.signup);
router.post('/login', Auth.login);
router.post('/logout', (req, res) => res.status(501).json({ error: 'Not implemented' }));
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
