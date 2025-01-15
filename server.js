const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        console.log('Received:', message);

        // Forward only text data
        if (typeof message === 'string') {
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            console.log('Ignoring non-text message');
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });

    socket.on('error', (err) => {
        console.error('WebSocket error:', err);
    });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
