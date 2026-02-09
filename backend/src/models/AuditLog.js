const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['ea', 'backend', 'frontend'], required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    type: { type: String, required: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    eventId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);

