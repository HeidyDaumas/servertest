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
    const patternRegex = /^[a-zA-Z]+,\d+,\d+,\d+$/; // e.g. "sine,1000,30000,5"
    return patternRegex.test(message);
}
// Periodically send pings to each client, drop unresponsive ones


console.log(`WebSocket server is running on ws://localhost:${PORT}`);
