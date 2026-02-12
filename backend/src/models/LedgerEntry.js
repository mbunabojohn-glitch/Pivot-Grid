const mongoose = require('mongoose')

const LedgerEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['PROFIT', 'PLATFORM_FEE', 'WITHDRAWAL', 'FEE_SETTLEMENT'], required: true, index: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    referenceId: { type: String, index: true }
  },
  { timestamps: true }
)

module.exports = mongoose.model('LedgerEntry', LedgerEntrySchema)
