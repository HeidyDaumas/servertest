const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('Client connected');

    // Mark each new connection as alive from the start
    socket.isAlive = true;

    // Handle incoming messages
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

    // When the server gets a pong from this client, mark it as alive again
    socket.on('pong', () => {
        socket.isAlive = true;
    });

    // Log disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Regex function to validate "frequency,amplitude,duration"
function isValidPattern(message) {
    const patternRegex = /^\d+,\d+,\d+$/; // e.g. "90,30000,100"
    return patternRegex.test(message);
}

// Periodically send pings to each client, drop unresponsive ones
setInterval(() => {
    server.clients.forEach((socket) => {
        // If it's not open, skip
        if (socket.readyState !== WebSocket.OPEN) {
            return;
        }

        // If isAlive was set to false previously, terminate
        if (!socket.isAlive) {
            console.log('Terminating unresponsive client');
            return socket.terminate();
        }

        // Otherwise, mark as not alive and send a ping
        socket.isAlive = false;
        socket.ping(); // The client should auto-respond with a “pong” frame
    });
}, 10000); // Ping every 10 seconds

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
