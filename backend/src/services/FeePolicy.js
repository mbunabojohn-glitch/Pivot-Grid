const fs = require('fs');
const { loadEnv } = require('../config/env');
let cache = { loadedAt: 0, cfg: null };
function loadConfig() {
  const env = loadEnv();
  const reloadMs = parseInt(env.FEE_POLICY_RELOAD_MS || '300000', 10);
  const now = Date.now();
  if (cache.cfg && now - cache.loadedAt < reloadMs) return cache.cfg;
  const file = env.FEE_POLICY_FILE;
  if (file) {
    try {
      const raw = fs.readFileSync(file).toString();
      const cfg = JSON.parse(raw);
      cache = { loadedAt: now, cfg };
      return cfg;
    } catch {
      cache = { loadedAt: now, cfg: null };
    }
  }
  cache = { loadedAt: now, cfg: null };
  return null;
}
function getFeeFraction(ctx = {}) {
  const env = loadEnv();
  const cfg = loadConfig();
  const basePct = parseFloat(env.PLATFORM_FEE_PCT || '20');
  let pct = basePct;
  if (cfg && typeof cfg.defaultPct === 'number') {
    pct = cfg.defaultPct;
  }
  if (cfg && Array.isArray(cfg.tiers)) {
    const gp = Number(ctx.grossProfit || 0);
    for (const t of cfg.tiers) {
      const min = Number(t.minGross ?? -Infinity);
      const max = Number(t.maxGross ?? Infinity);
      if (gp >= min && gp <= max && typeof t.pct === 'number') {
        pct = t.pct;
      }
    }
  }
  if (cfg && Array.isArray(cfg.promos)) {
    const now = ctx.now ? new Date(ctx.now).getTime() : Date.now();
    for (const p of cfg.promos) {
      const start = p.start ? new Date(p.start).getTime() : -Infinity;
      const end = p.end ? new Date(p.end).getTime() : Infinity;
      const appliesToAccount = Array.isArray(p.accounts) ? p.accounts.includes(String(ctx.accountId || '')) : false;
      if (now >= start && now <= end && appliesToAccount && typeof p.pct === 'number') {
        pct = p.pct;
      }
    }
  }
  const frac = Math.min(1, Math.max(0, Number(pct) / 100));
  return frac;
}
module.exports = { getFeeFraction };
