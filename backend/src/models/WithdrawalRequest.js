const mongoose = require('mongoose')

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['requested', 'processing', 'completed', 'rejected'], default: 'requested' },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema)
