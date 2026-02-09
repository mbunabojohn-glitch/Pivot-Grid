const { WebSocketServer } = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', () => (ws.isAlive = true));
    ws.on('message', (msg) => {
      let data;
      try {
        data = JSON.parse(msg.toString());
      } catch {
        return;
      }
      const type = data?.type;
      const payload = data?.payload;
      if (!type) return;
      const map = {
        'ea:equity': 'equity_update',
        'ea:drawdown': 'drawdown_update',
        'ea:trade_opened': 'trade_opened',
        'ea:trade_updated': 'trade_updated',
        'ea:trade_closed': 'trade_closed',
        'ea:audit': 'audit_event',
        'ea:profit_split': 'profit_split_ready',
        'ea:ai_explanation': 'ai_explanation',
      };
      const event = map[type];
      if (event) {
        wss.broadcast(event, payload);
      }
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
