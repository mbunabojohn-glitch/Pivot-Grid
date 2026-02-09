const mongoose = require('mongoose');

// AuditLog model
// Fields:
// - action: textual action performed
// - source: ea/backend/frontend
// - timestamp
// Indexes:
// - accountId, eventId, timestamp
const AuditLogSchema = new mongoose.Schema(
  {
    action: { type: String },
    source: { type: String, enum: ['ea', 'backend', 'frontend'], required: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', index: true },
    payload: { type: mongoose.Schema.Types.Mixed },
    eventId: { type: String, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    // legacy field
    type: { type: String, select: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
