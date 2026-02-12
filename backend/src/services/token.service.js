const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { loadEnv } = require('../config/env');
const RefreshToken = require('../models/RefreshToken');

const env = loadEnv();

function encryptToken(plain) {
  const keySource = env.REFRESH_TOKEN_ENC_KEY || '';
  const key = crypto.createHash('sha256').update(String(keySource)).digest(); // 32 bytes
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}.${tag.toString('hex')}.${enc.toString('hex')}`;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

async function signRefreshToken(user) {
  const token = jwt.sign(
    { sub: String(user._id), type: 'refresh' },
    env.JWT_REFRESH_SECRET || env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  const encrypted = encryptToken(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  try {
    await RefreshToken.create({ userId: user._id, token: encrypted, expiresAt });
  } catch (_) {}
  return encrypted;
}

function generateAccessToken(user) {
  return signAccessToken(user);
}

async function generateRefreshToken(user) {
  return signRefreshToken(user);
}

module.exports = { signAccessToken, signRefreshToken, generateAccessToken, generateRefreshToken };
