const mongoose = require('mongoose');
const User = require('../models/User');
const WithdrawalRecord = require('../models/WithdrawalRecord');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
  try {
    await User.syncIndexes();
    await WithdrawalRecord.syncIndexes();
  } catch (_) {}
}

module.exports = { connectDB };


