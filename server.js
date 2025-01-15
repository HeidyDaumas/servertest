const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
    if (typeof message === "string") {
      console.log(`Received string: ${message}`);
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else {
      console.log("Received Uint8Array data");
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message, { binary: true });
        }
      });
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
