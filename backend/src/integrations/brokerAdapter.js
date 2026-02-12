const { loadEnv } = require('../config/env');
const { DemoAdapter } = require('../adapters/DemoAdapter');
const { MT5Adapter } = require('../adapters/MT5Adapter');
const { FutureBrokerAdapter } = require('../adapters/FutureBrokerAdapter');

const env = loadEnv();
let adapter;
if (String(env.BROKER_PROVIDER || '').toLowerCase() === 'mt5') {
  adapter = new MT5Adapter();
} else if (String(env.BROKER_PROVIDER || '').toLowerCase() === 'future') {
  adapter = new FutureBrokerAdapter();
} else {
  adapter = new DemoAdapter();
}
module.exports = { adapter };
