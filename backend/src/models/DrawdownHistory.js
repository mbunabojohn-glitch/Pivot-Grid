const mongoose = require('mongoose');

// Drawdown model
// Fields:
// - peakEquity, currentEquity, percent
// - accountId, timestamp
// Indexes: accountId + timestamp
const DrawdownHistorySchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    peakEquity: { type: Number, required: true },
    currentEquity: { type: Number, required: true },
    percent: { type: Number, required: true },
    // legacy fields
    drawdownPct: { type: Number, select: false },
    equity: { type: Number, select: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DrawdownHistory', DrawdownHistorySchema);
