const mongoose = require('mongoose');

// TradingAccount model
// Fields:
// - broker: broker name
// - accountNumber: MT5 account number
// - balance/equity: last known figures for convenience (authoritative source is EA snapshots)
// Indexes:
// - userId, accountNumber
const TradingAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    broker: { type: String, required: true, index: true },
    accountNumber: { type: String, required: true, index: true },
    balance: { type: Number, default: 0 },
    equity: { type: Number, default: 0 },
    // legacy aliases (optional)
    brokerName: { type: String, select: false },
    mt5AccountNumber: { type: String, select: false },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradingAccount', TradingAccountSchema);
