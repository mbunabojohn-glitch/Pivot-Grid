const mongoose = require('mongoose');

const EquitySnapshotSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    equity: { type: Number, required: true },
    balance: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquitySnapshot', EquitySnapshotSchema);

