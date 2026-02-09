const mongoose = require('mongoose');

// EquitySnapshot model
// Fields:
// - accountId: reference to trading account
// - equity: account equity at timestamp
// - timestamp: capture time (indexed for time-series queries)
// Note: balance retained for context but equity is primary for charts
const EquitySnapshotSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    equity: { type: Number, required: true },
    balance: { type: Number },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquitySnapshot', EquitySnapshotSchema);
