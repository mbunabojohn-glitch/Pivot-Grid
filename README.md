# Pivot Grid

Monorepo for a transparent, non-custodial trading dashboard.

## Backend (Node.js)
- Express server in `backend/src/server.js`
- Mongoose models: Users, Accounts, Trades, EquitySnapshot, DrawdownHistory, ProfitSplit, Withdrawal, WithdrawalRequest, AuditLog
- Read-only API routes under `backend/src/routes`
- WebSocket listener stubs for EA events in `backend/src/ws/index.js` and `backend/src/sockets/ea.js`

### Run backend
1. `cd backend`
2. `npm install`
3. Set `MONGO_URI` env (if you plan to connect), otherwise server runs without DB writes
4. `npm run dev`
5. WebSocket listens on the same port; default `PORT=4000`

### Mock EA (optional)
`node backend/mock-ea.js` to broadcast sample equity/drawdown and a TRADE_OPENED event.

## Frontend (React + Vite)
- Pages: Dashboard, Trade History, AI, Performance
- Components: BalanceCard, TradeTable, GrowthChart
- WebSocket client: `frontend/src/services/ws.js`
- Mock data: `frontend/src/mocks/*.js`

### Run frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open the printed localhost URL

## EA (MQL5)
- Folder: `ea/`
- Modules: `impulse_detection.mq5`, `fibonacci.mq5`, `risk_manager.mq5`, `order_executor.mq5`, `trade_logger.mq5`
- Main: `main_pivotgrid_ea.mq5` with scaffolded comments
- Trading logic resides only in EA; backend/frontend do not execute trades.

## Security and Privacy
- No payment methods or sensitive fields (NIN, BVN, bank, card) are collected or stored.
- WebSocket and API are read-only for client display and logging.

## Development Notes
- Install React Developer Tools to inspect components and profile performance.
- The UI theme is controlled by CSS variables in `frontend/src/styles/theme.css`.
