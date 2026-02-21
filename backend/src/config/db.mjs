import mongoose from 'mongoose';
import dns from 'node:dns';
import User from '../models/User.js';
import WithdrawalRecord from '../models/WithdrawalRecord.js';

export async function connectDB(uri) {
  const customDns = process.env.MONGO_DNS_SERVERS;
  if (customDns) {
    try {
      const servers = String(customDns)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (servers.length) dns.setServers(servers);
    } catch {}
  }

  mongoose.set('strictQuery', true);
  const opts = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };
  await mongoose.connect(uri, opts);
  console.log('MongoDB connected');

  try {
    await User.syncIndexes();
    await WithdrawalRecord.syncIndexes();
  } catch {}
}
