const mongoose = require('mongoose');
const dns = require('dns');
const User = require('../models/User');
const WithdrawalRecord = require('../models/WithdrawalRecord');

async function connectDB(uri) {
  // Optional: allow overriding DNS resolvers for MongoDB SRV lookups
  const customDns = process.env.MONGO_DNS_SERVERS;
  if (customDns) {
    try {
      const servers = String(customDns)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (servers.length) dns.setServers(servers);
    } catch (_) {}
  }

  mongoose.set('strictQuery', true);
  // Sensible defaults for connection robustness
  const opts = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };
  await mongoose.connect(uri, opts);
  console.log('MongoDB connected');

  // Keep indexes in sync for key collections
  try {
    await User.syncIndexes();
    await WithdrawalRecord.syncIndexes();
  } catch (_) {}
}

module.exports = { connectDB };

