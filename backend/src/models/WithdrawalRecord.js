const mongoose = require('mongoose');

const WithdrawalRecordSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    amount: { type: Number, required: true },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' },
    note: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalRecord', WithdrawalRecordSchema);

