import mongoose from 'mongoose';

const EquitySnapshotSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    equity: { type: Number, required: true },
    balance: { type: Number },
    floatingPnL: { type: Number, default: 0 },
    drawdownPercent: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.EquitySnapshot || mongoose.model('EquitySnapshot', EquitySnapshotSchema);
