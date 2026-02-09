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
      const type = data?.type;
      const payload = data?.payload;
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
