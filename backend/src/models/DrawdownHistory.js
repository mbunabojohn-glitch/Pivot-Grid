const mongoose = require('mongoose');

const DrawdownHistorySchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    drawdownPct: { type: Number, required: true },
    peakEquity: { type: Number },
    equity: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DrawdownHistory', DrawdownHistorySchema);

