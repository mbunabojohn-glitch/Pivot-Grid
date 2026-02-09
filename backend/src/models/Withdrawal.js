const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'bank' },
    status: { type: String, enum: ['requested', 'processing', 'completed', 'rejected'], default: 'requested' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);

