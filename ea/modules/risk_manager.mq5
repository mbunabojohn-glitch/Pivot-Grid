#property strict
// Module: risk_manager
// Purpose: Enforce strict risk rules and compute position sizing.
// Rules:
// - Max risk per trade: 5%
// - Max concurrent trades: 2
// - No martingale, grid, averaging down
// - Drawdown protection: stop at 50% drawdown (equity vs peak/balance)
// - Spread filter enforced; skip trade if spread exceeds threshold
// Key checks:
// - Account equity/balance, symbol spread, open/pending orders count
// Position sizing:
// - Convert entry→SL price distance to currency risk using tick size/value
// - Lots = riskAmount / perLotRisk, normalized to broker step

bool RiskCheckPreTrade(string symbol)
{
  // TODO: Check max concurrent trades (<=2) for symbol/account
  // TODO: Enforce spread filter threshold
  // TODO: Enforce 50% drawdown protection (skip when exceeded)
  // Return true only when all pre-trade checks pass.
  return true;
}

double CalcLots(double entry, double sl, double riskFrac)
{
  // TODO: Calculate price distance between entry and SL
  // TODO: Convert to currency risk using SYMBOL_TRADE_TICK_SIZE/value
  // TODO: Compute riskAmount = Account equity × riskFrac (default 0.05)
  // TODO: Normalize lots to broker step and min/max constraints
  return 0.0;
}
