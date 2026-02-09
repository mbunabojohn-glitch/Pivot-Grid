const mongoose = require('mongoose');

// Trade model
// Core fields per spec:
// - symbol, direction, entry, sl, tp, riskPercent, outcome
// Additional fields retained for strategy tracking (impulseId, rrTarget, state)
const TradeSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    symbol: { type: String, required: true, index: true },
    direction: { type: String, enum: ['BUY', 'SELL'], required: true, index: true },
    entry: { type: Number }, // actual executed/target entry
    sl: { type: Number },
    tp: { type: Number },
    riskPercent: { type: Number },
    outcome: {
      pnl: { type: Number },
      reason: { type: String },
    },
    // existing strategy fields
    impulseId: { type: String, index: true },
    entryLimit: { type: Number },
    riskPct: { type: Number, select: false },
    rrTarget: { type: Number, default: 2.0 },
    state: { type: String, enum: ['pending', 'open', 'closed', 'canceled'], default: 'pending', index: true },
    invalidationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trade', TradeSchema);
