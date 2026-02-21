import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import crypto from 'node:crypto';
import passport from 'passport';

import envMod from './config/env.js';
const { loadEnv } = envMod;

import dbMod from './config/db.js';
const { connectDB } = dbMod;

import apiRoutes from './routes/index.mjs';

import wsMod from './ws/index.js';
const { setupWebSocket } = wsMod;

import reconMod from './services/ReconciliationJob.js';
const { scheduleReconciliation } = reconMod;

import brokerMod from './integrations/brokerAdapter.js';
const { adapter } = brokerMod;

import configurePassportDefault from './config/passport.js';
const configurePassport = configurePassportDefault.default || configurePassportDefault;

const env = loadEnv();
const app = express();

// Request ID and IP tracing
app.use((req, res, next) => {
  const id = (req.headers['x-request-id'] && String(req.headers['x-request-id'])) || crypto.randomBytes(16).toString('hex');
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  req.clientIp = (req.headers['x-forwarded-for'] && String(req.headers['x-forwarded-for']).split(',')[0].trim()) || req.ip || req.connection.remoteAddress;
  next();
});

// Minimal security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(passport.initialize());
morgan.token('id', (req) => req.requestId);
morgan.token('ip', (req) => req.clientIp);
app.use(morgan(':method :url :status - :response-time ms - id=:id ip=:ip'));

// Simple IP-based rate limiting
const rateState = new Map();
app.use((req, res, next) => {
  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_MS;
  const max = env.RATE_LIMIT_MAX;
  const key = req.clientIp || 'unknown';
  const entry = rateState.get(key) || { start: now, count: 0 };
  if (now - entry.start > windowMs) {
    entry.start = now;
    entry.count = 0;
  }
  entry.count += 1;
  rateState.set(key, entry);
  if (entry.count > max) {
    return res.status(429).json({ error: 'rate_limited' });
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pivot-grid-backend' });
});

app.get('/db/health', async (req, res) => {
  try {
    const mongoose = (await import('mongoose')).default;
    const state = mongoose.connection.readyState;
    let ping = null;
    let ok = false;
    if (mongoose.connection && mongoose.connection.db) {
      ping = await mongoose.connection.db.admin().command({ ping: 1 });
      ok = Boolean(ping && ping.ok === 1);
    } else {
      ok = state === 1;
    }
    res.json({
      ok,
      state,
      name: (mongoose.connection && mongoose.connection.name) || null,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.use('/api', apiRoutes);

const server = createServer(app);
const wss = setupWebSocket(server);

(async () => {
  try {
    await connectDB(env.MONGO_URI);
    console.log('Database connected');
  } catch (err) {
    console.error('MongoDB connection failed, continuing without DB', err.message);
  }
  configurePassport(passport, env);
  server.listen(env.PORT, () => {
    console.log(`Pivot Grid backend listening on port ${env.PORT}`);
  });
  try {
    scheduleReconciliation(adapter, env.RECONCILE_INTERVAL_MS);
    console.log('Reconciliation job scheduled');
  } catch (e) {
    console.error('Failed to schedule reconciliation job', e.message);
  }
})();

let tick = 0;
let lastTradeSent = false;
setInterval(() => {
  const ts = Date.now();
  const equityBase = 10000;
  const equity = equityBase + Math.sin(tick / 10) * 150 + (tick * 2);
  const balance = equityBase + (tick * 1.5);
  const drawdownPct = Math.max(0, (equityBase - equity) / Math.max(equityBase, equity));
  wss.broadcast('equity_update', { timestamp: ts, equity: Number(equity.toFixed(2)), balance: Number(balance.toFixed(2)) });
  wss.broadcast('drawdown_update', { drawdownPct: Number(drawdownPct.toFixed(4)) });
  if (!lastTradeSent) {
    lastTradeSent = true;
    wss.broadcast('trade_opened', {
      tradeId: 'demo-1',
      symbol: 'EURUSD',
      direction: 'BUY',
      entryLimit: 1.0800,
      sl: 1.0750,
      tp: 1.0900,
      riskPct: 5,
      state: 'pending',
      entryReason: 'Fibonacci 0.55 entry in 0.50–0.618 zone after H4 impulse',
    });
  }
  if (tick % 20 === 0) {
    wss.broadcast('profit_split_ready', {
      grossPnL: 250,
      netPnL: 200,
      clientShare: 160,
      platformShare: 40,
      period: 'current_week',
    });
    wss.broadcast('ai_explanation', {
      title: 'Deterministic explanation',
      text: 'Recent updates reflect equity changes and scheduled profit split summaries. All trades obey EA strategy; the dashboard is informational only.',
    });
  }
  tick++;
}, 2000);
