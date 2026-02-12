const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');

function validateEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  return typeof pw === 'string' && pw.length >= 8;
}

async function signup(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!validateEmail(email)) return res.status(400).json({ error: 'invalid_email' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'invalid_password' });
    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: 'email_exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hash,
      isVerified: false,
      role: 'trader',
      tradingLocked: false,
    });
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    return res.status(201).json({
      user: { id: String(user._id), email, role: user.role, isVerified: user.isVerified },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    if (e && e.code === 11000) {
      return res.status(409).json({ error: 'email_exists' });
    }
    return res.status(500).json({ error: 'signup_failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!validateEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ error: 'invalid_credentials' });
    }
    const user = await User.findOne({ email }).lean();
    if (!user || !user.password) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    return res.json({
      user: { id: String(user._id), email: user.email, role: user.role, isVerified: user.isVerified },
      accessToken,
      refreshToken,
    });
  } catch (e) {
    return res.status(500).json({ error: 'login_failed' });
  }
}

function logout(req, res) {
  res.status(501).json({ error: 'Not implemented' });
}

module.exports = { signup, login, logout };
