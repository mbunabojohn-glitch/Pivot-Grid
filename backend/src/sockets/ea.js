function registerEAChannel(wss) {
  // Placeholder: future EA authentication/authorization can go here
  // This module can be used to group EA-specific WS handlers
  return {
    push(event, payload) {
      wss.broadcast(event, payload);
    },
  };
}

module.exports = { registerEAChannel };

