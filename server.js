const WebSocket = require("ws");

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on("connection", (socket) => {
  console.log("Client connected");

  // Send "Hello World" to the client upon connection
  socket.send("Hello World");

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
    
    // Log the message type
    if (typeof message === "string") {
      console.log(`Received string: ${message}`);
    } else {
      console.log("Received Uint8Array data");
    }

    // Respond with "Hello World" for every received message
    socket.send("Hello World");
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
