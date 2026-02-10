const { loadEnv } = require('../config/env');

function getFeeFraction() {
  const env = loadEnv();
  const pct = parseFloat(env.PLATFORM_FEE_PCT || 20);
  const frac = Math.min(1, Math.max(0, pct / 100));
  return frac;
}

module.exports = { getFeeFraction };
