const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    mt5Login: { type: String, required: true, index: true },
    broker: { type: String },
    symbolPermissions: { type: [String], default: ['EURUSD', 'BTCUSD'] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    tradingLocked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Account', AccountSchema);
