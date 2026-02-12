const mongoose = require('mongoose');

const CommissionReceiptSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    amount: { type: Number, required: true },
    periodStart: { type: Date },
    periodEnd: { type: Date },
    splitRef: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfitSplit', index: true },
    status: { type: String, enum: ['pending', 'settled', 'failed'], default: 'pending', index: true },
    provider: { type: String }, // broker or processor identifier
    idempotencyKey: { type: String, index: true },
    settledAt: { type: Date },
    // extended fields per spec
    withdrawalRef: { type: mongoose.Schema.Types.ObjectId, ref: 'WithdrawalRecord', index: true },
    grossProfit: { type: Number },
    platformFee: { type: Number },
    traderPayout: { type: Number },
    brokerRefId: { type: String, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CommissionReceipt', CommissionReceiptSchema);
