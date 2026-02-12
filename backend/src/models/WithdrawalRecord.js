const mongoose = require('mongoose');

// WithdrawalRequest model (tracking only)
// Fields:
// - amount, status, requestedAt
// - No payment method fields, no banking data
const WithdrawalRecordSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    amount: { type: Number, required: true },
    requestedAt: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: ['pending', 'processing', 'approved', 'completed', 'rejected'], default: 'pending', index: true },
    processedAt: { type: Date },
    note: { type: String },
    brokerRefId: { type: String, index: true },
    grossProfit: { type: Number },
    platformFee: { type: Number },
    traderPayout: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalRecord', WithdrawalRecordSchema);
