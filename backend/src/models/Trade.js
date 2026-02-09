const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    symbol: { type: String, required: true },
    direction: { type: String, enum: ['BUY', 'SELL'], required: true },
    impulseId: { type: String, index: true },
    entryLimit: { type: Number },
    sl: { type: Number },
    tp: { type: Number },
    riskPct: { type: Number },
    rrTarget: { type: Number, default: 2.0 },
    state: { type: String, enum: ['pending', 'open', 'closed', 'canceled'], default: 'pending' },
    result: {
      pnl: { type: Number },
      reason: { type: String },
    },
    invalidationReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trade', TradeSchema);

