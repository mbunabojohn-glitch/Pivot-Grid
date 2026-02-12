const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../services/token.service');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { loadEnv } = require('../config/env');
const { sendMail } = require('../services/mailer');
const env = loadEnv();

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
      tradingLocked: false,
    });
    const token = jwt.sign({ id: String(user._id) }, env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token });
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
    const token = jwt.sign({ id: String(user._id) }, env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: 'login_failed' });
  }
}

async function logout(req, res) {
  return res.status(501).json({ error: 'Not implemented' });
}

async function enableTwoFA(req, res) {
  try {
    const id = req.authUser?._id || req.user?.sub;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(400).json({ error: '2fa_disabled' });
  } catch (e) {
    return res.status(500).json({ error: '2fa_enable_failed' });
  }
}

async function verifyTwoFA(req, res) {
  try {
    const id = req.authUser?._id || req.user?.sub;
    if (!id) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(400).json({ error: '2fa_disabled' });
  } catch (e) {
    return res.status(500).json({ error: '2fa_verify_failed' });
  }
}

async function verifyEmail(req, res) {
  try {
    return res.status(400).json({ error: 'email_verification_disabled' });
  } catch (e) {
    return res.status(500).json({ error: 'verify_failed' });
  }
}

module.exports = { signup, login, logout, enableTwoFA, verifyTwoFA, verifyEmail };
