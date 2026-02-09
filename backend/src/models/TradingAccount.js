const mongoose = require('mongoose');

const TradingAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    brokerName: { type: String, required: true },
    mt5AccountNumber: { type: String, required: true, index: true },
    currency: { type: String, default: 'USD' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradingAccount', TradingAccountSchema);

