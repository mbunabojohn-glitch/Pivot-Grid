const mongoose = require('mongoose');

// User model
// Fields:
// - email: unique identifier for login
// - role: client or admin
// - status: active/inactive (platform access state)
// Notes:
// - No payment or personal banking fields are stored
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['client', 'admin'], default: 'client', index: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
    passwordHash: { type: String }, // optional for future auth; not required for non-custodial
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
