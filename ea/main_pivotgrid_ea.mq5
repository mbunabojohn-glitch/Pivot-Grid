#property strict
// EA: Pivot Grid (MT5)
// Purpose: Deterministic execution of the Fibonacci Pullback strategy on H4.
// Constraints:
// - Trading logic lives only in this EA; backend/frontend never place trades
// - LIMIT orders only; strict risk and invalidation rules
// - One trade per impulse; no re-entry
// Modules:
// - impulse_detection: find valid impulses
// - fibonacci: compute entry/SL/TP levels
// - risk_manager: apply risk checks and lot sizing
// - order_executor: place/manage orders
// - trade_logger: send audit logs to backend

#include "modules/impulse_detection.mq5"
#include "modules/fibonacci.mq5"
#include "modules/risk_manager.mq5"
#include "modules/order_executor.mq5"
#include "modules/trade_logger.mq5"

int OnInit()
{
  // TODO: Load inputs (spread thresholds, buffers) if needed
  // TODO: Configure allowed symbols (EURUSD, BTCUSD)
  EventSetTimer(60);
  return(INIT_SUCCEEDED);
}

void OnDeinit(const int reason)
{
  EventKillTimer();
}

void OnTimer()
{
  // TODO: Optionally guard to act only on H4 close
  // TODO: Iterate allowed symbols if multi-symbol trading enabled
  HandleSymbol(_Symbol);
}

void HandleSymbol(string symbol)
{
  // Pipeline: DetectImpulse -> ComputeFibEntry -> Risk checks -> CalcLots -> PlaceLimit -> Log
  double low=0.0, high=0.0;
  int dir=0;
  bool ok=DetectImpulse(symbol, PERIOD_H4, low, high, dir);
  if(!ok) return;
  double entry=0.0, sl=0.0, tp=0.0;
  ComputeFibEntry(low, high, dir, entry, sl, tp);
  if(!RiskCheckPreTrade(symbol)) return;
  double lots=CalcLots(entry, sl, 0.05);
  if(lots<=0.0) return;
  bool placed=PlaceLimit(dir, symbol, entry, sl, tp, lots);
  LogTradeAttempt(symbol, dir, entry, sl, tp, lots);
}
