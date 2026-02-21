import { loadEnv } from '../config/env.mjs';

import demoMod from '../adapters/DemoAdapter.js';
const { DemoAdapter } = demoMod;
import mt5Mod from '../adapters/MT5Adapter.js';
const { MT5Adapter } = mt5Mod;
import futureMod from '../adapters/FutureBrokerAdapter.js';
const { FutureBrokerAdapter } = futureMod;

const env = loadEnv();
let adapter;
if (String(env.BROKER_PROVIDER || '').toLowerCase() === 'mt5') {
  adapter = new MT5Adapter();
} else if (String(env.BROKER_PROVIDER || '').toLowerCase() === 'future') {
  adapter = new FutureBrokerAdapter();
} else {
  adapter = new DemoAdapter();
}

export { adapter };
