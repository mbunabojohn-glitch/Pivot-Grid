const mongoose = require('mongoose');

// ProfitSplit model
// Fields:
// - week: ISO week identifier (e.g., '2026-W06')
// - grossProfit, clientShare, platformShare
// Also store periodStart/periodEnd for clarity
const ProfitSplitSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    week: { type: String, index: true },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    grossProfit: { type: Number, default: 0 },
    clientShare: { type: Number, default: 0 },
    platformShare: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'calculated', 'distributed'], default: 'pending' },
    // legacy fields
    grossPnL: { type: Number, select: false },
    netPnL: { type: Number, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProfitSplit', ProfitSplitSchema);
