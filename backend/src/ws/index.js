const { WebSocketServer } = require('ws');
const { registerEAChannel } = require('../sockets/ea');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });
  const ea = registerEAChannel(wss);

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', async (msg) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        return;
      }
      let type = data?.type;
      let payload = data?.payload;
      if (!type) {
        const event = (data?.event || '').toUpperCase();
        if (event === 'TRADE_OPENED') {
          type = 'ea:trade_opened';
          payload = {
            tradeId: data.tradeId || `${data.symbol || 'UNKNOWN'}-${Date.now()}`,
            symbol: data.symbol,
            direction: data.direction,
            entryLimit: data.entry,
            sl: data.sl,
            tp: data.tp,
            riskPct: data.riskPercent ?? data.riskPct,
            state: 'pending',
            entryReason: data.reason,
          };
        } else if (event === 'TRADE_UPDATED') {
          type = 'ea:trade_updated';
          payload = {
            tradeId: data.tradeId,
            sl: data.sl,
            tp: data.tp,
            state: data.state,
            result: data.result,
          };
        } else if (event === 'TRADE_CLOSED') {
          type = 'ea:trade_closed';
          payload = {
            tradeId: data.tradeId,
            state: 'closed',
            result: data.result,
          };
        }
      }
      if (!type) return;
      await ea.handle(type, payload);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  wss.broadcast = (event, payload) => {
    const data = JSON.stringify({ event, payload });
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  };

  return wss;
}

module.exports = { setupWebSocket };
