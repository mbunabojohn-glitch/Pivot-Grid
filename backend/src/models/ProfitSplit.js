const mongoose = require('mongoose');

const ProfitSplitSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    grossPnL: { type: Number, default: 0 },
    netPnL: { type: Number, default: 0 },
    clientShare: { type: Number, default: 0 },
    platformShare: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'calculated', 'distributed'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProfitSplit', ProfitSplitSchema);

