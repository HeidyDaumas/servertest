const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('Client connected');
    socket.send("Hello World");

    socket.on('message', (message) => {
        console.log('Received:', message);
        server.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    socket.on('pong', () => {
        socket.isAlive = true;
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Heartbeat to keep connections alive
setInterval(() => {
    server.clients.forEach((socket) => {
        if (socket.isAlive === false) {
            return socket.terminate();
        }
        socket.isAlive = false;
        socket.ping();
    });
}, 10000);

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
