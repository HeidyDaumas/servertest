const WebSocket = require("ws");
const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ 
    port: PORT,
    // Enable ping/pong
    pingInterval: 5000,
    pingTimeout: 2000
});

server.on("connection", (socket) => {
    console.log("Client connected");
    
    // Send "Hello World" to the client upon connection
    socket.send("Hello World");
    
    // Handle pings to keep connection alive
    socket.isAlive = true;
    socket.on('pong', () => {
        socket.isAlive = true;
    });
    
    socket.on("message", (message) => {
        // Forward the message to all other clients
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        
        if (message === "OK") {
            console.log("Received OK from client");
        }
    });
    
    socket.on("close", () => {
        console.log("Client disconnected");
    });
});

// Check for dead connections
const interval = setInterval(() => {
    server.clients.forEach((socket) => {
        if (socket.isAlive === false) {
            return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping();
    });
}, 10000);

server.on('close', function close() {
    clearInterval(interval);
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
