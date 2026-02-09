export const dashboardMock = {
  balance: 10000,
  equity: [
    { t: Date.now() - 120000, equity: 9980 },
    { t: Date.now() - 60000, equity: 10010 },
    { t: Date.now(), equity: 10025 },
  ],
  drawdownPct: 0.02,
  openTrades: 1,
}
