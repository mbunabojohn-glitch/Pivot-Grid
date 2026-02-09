const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    amount: { type: Number, required: true },
    source: { type: String, enum: ['mt5_balance_change', 'broker_statement'], required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    note: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deposit', DepositSchema);

