const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (message) => {
        console.log('Received:', message);

        // Validate and forward only valid pattern data
        if (isValidPattern(message)) {
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            console.log('Invalid pattern, ignoring:', message);
        }
    });

    socket.on('pong', () => {
        socket.isAlive = true;
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to validate pattern format
function isValidPattern(message) {
    const patternRegex = /^\d+,\d+,\d+$/; // Matches "frequency,amplitude,duration"
    return patternRegex.test(message);
}

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
