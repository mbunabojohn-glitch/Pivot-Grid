const WebSocket = require('ws')

function connect(url) {
  const ws = new WebSocket(url)
  ws.on('open', () => {
    let tick = 0
    setInterval(() => {
      const ts = Date.now()
      const equityBase = 10000
      const equity = equityBase + Math.sin(tick / 10) * 150 + (tick * 2)
      const balance = equityBase + (tick * 1.5)
      const drawdownPct = Math.max(0, (equityBase - equity) / Math.max(equityBase, equity))
      ws.send(JSON.stringify({ type: 'ea:equity', payload: { timestamp: ts, equity: Number(equity.toFixed(2)), balance: Number(balance.toFixed(2)) } }))
      ws.send(JSON.stringify({ type: 'ea:drawdown', payload: { drawdownPct: Number(drawdownPct.toFixed(4)) } }))
      if (tick === 2) {
        ws.send(JSON.stringify({
          event: 'TRADE_OPENED',
          symbol: 'EURUSD',
          direction: 'BUY',
          entry: 1.0825,
          sl: 1.078,
          tp: 1.0915,
          riskPercent: 2,
          reason: 'H4 impulse + 0.55 fib retracement'
        }))
      }
      if (tick % 20 === 0) {
        ws.send(JSON.stringify({ type: 'ea:profit_split', payload: { grossPnL: 250, netPnL: 200, clientShare: 160, platformShare: 40, period: 'current_week' } }))
        ws.send(JSON.stringify({ type: 'ea:ai_explanation', payload: { title: 'Deterministic explanation', text: 'Live mock EA broadcasting equity and trade events.' } }))
      }
      tick++
    }, 2000)
  })
  ws.on('close', () => {
    setTimeout(() => connect(url), 2000)
  })
  ws.on('error', () => {})
}

const url = `ws://localhost:${process.env.PORT || 4000}`
connect(url)
