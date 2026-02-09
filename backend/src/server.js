const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { loadEnv } = require('./config/env');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes');
const { setupWebSocket } = require('./ws');

const env = loadEnv();
const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pivot-grid-backend' });
});

app.use('/api', apiRoutes);

const server = http.createServer(app);
const wss = setupWebSocket(server);

(async () => {
  try {
    await connectDB(env.MONGO_URI);
    console.log('Database connected');
  } catch (err) {
    console.error('MongoDB connection failed, continuing without DB', err.message);
  }
  server.listen(env.PORT, () => {
    console.log(`Pivot Grid backend listening on port ${env.PORT}`);
  });
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
      entryReason: 'Fibonacci 0.55 entry in 0.50–0.618 zone after H4 impulse'
    });
  }
  if (tick % 20 === 0) {
    wss.broadcast('profit_split_ready', {
      grossPnL: 250,
      netPnL: 200,
      clientShare: 160,
      platformShare: 40,
      period: 'current_week'
    });
    wss.broadcast('ai_explanation', {
      title: 'Deterministic explanation',
      text:
        'Recent updates reflect equity changes and scheduled profit split summaries. All trades obey EA strategy; the dashboard is informational only.'
    });
  }
  tick++;
}, 2000);

