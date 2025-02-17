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
            // Forward the full message (including any hand prefix) to all other clients.
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

// Regex function to validate an optional hand prefix and then "waveform,frequency,amplitude,duration"
function isValidPattern(message) {
    // Accepts an optional "left|" or "right|" prefix.
    const patternRegex = /^(?:(left|right)\|)?[a-zA-Z]+,\d+,\d+,\d+$/; // e.g. "left|sine,1000,30000,5" or "sine,1000,30000,5"
    return patternRegex.test(message);
}

// (Optional) Periodically ping clients, drop unresponsive ones...

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
