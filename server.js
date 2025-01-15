const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on("connection", (socket) => {
  console.log("Client connected");
  // Send "Hello World" to the client upon connection
  socket.send("Hello World");
  
  socket.on("message", (message) => {
    // Just receive the data without logging anything
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
